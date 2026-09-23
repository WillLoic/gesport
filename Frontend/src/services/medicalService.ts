import { apiFetch } from './apiClient';
import { MedicalRecord } from '../types';

export interface BackendMedicalRecord {
  id?: number;
  member: number;
  member_id?: number;
  member_detail?: any;
  injury_type: string;
  body_part: string;
  injury_date: string;
  expected_return_date?: string | null;
  status: string;
  doctor_notes?: string;
  return_clearance_certified?: boolean;
  created_at?: string;
}

/**
 * Convertit un dossier médical du backend Django vers le format Frontend
 */
export function mapBackendMedicalRecordToFrontend(bMed: BackendMedicalRecord): MedicalRecord {
  const memberName = bMed.member_detail
    ? `${bMed.member_detail.first_name || ''} ${bMed.member_detail.last_name || ''}`.trim()
    : 'Licencié';

  let memberTeam = 'Sans équipe';
  if (bMed.member_detail?.teams && bMed.member_detail.teams.length > 0) {
    memberTeam = bMed.member_detail.teams[0].team_name;
  } else if (bMed.member_detail?.team_name) {
    memberTeam = bMed.member_detail.team_name;
  }

  let mappedStatus: MedicalRecord['status'] = 'Indisponible';
  if (bMed.status === 'Réathlétisation') {
    mappedStatus = 'Réathlétisation';
  } else if (bMed.status === 'Apte' || bMed.status === 'Guéri / Feu vert') {
    mappedStatus = 'Guéri / Feu vert';
  } else if (bMed.status === 'Apte avec réserve') {
    mappedStatus = 'Apte avec réserve';
  } else {
    mappedStatus = 'Indisponible';
  }

  return {
    id: String(bMed.id),
    playerId: String(bMed.member || bMed.member_id || 1),
    playerName: memberName || 'Joueur',
    teamName: memberTeam,
    injuryType: bMed.injury_type || 'Blessure',
    bodyPart: bMed.body_part || 'Membre inférieur',
    severity: 'Modérée (1-4 sem)',
    injuryDate: bMed.injury_date ? bMed.injury_date.split('T')[0] : new Date().toISOString().split('T')[0],
    estimatedReturnDate: bMed.expected_return_date ? bMed.expected_return_date.split('T')[0] : '',
    status: mappedStatus,
    physioNotes: bMed.doctor_notes || '',
    prescribedCare: bMed.doctor_notes || '',
    doctorCleared: Boolean(bMed.return_clearance_certified),
  };
}

/**
 * Convertit un dossier médical Frontend vers le format backend Django JSON
 */
export function mapFrontendMedicalRecordToBackend(med: Partial<MedicalRecord>, memberId = 1, clubId = 1): BackendMedicalRecord {
  let backendStatus = 'Indisponible';
  if (med.status === 'Indisponible' || med.status === 'En soins') backendStatus = 'Indisponible';
  else if (med.status === 'Réathlétisation') backendStatus = 'Réathlétisation';
  else if (med.status === 'Guéri / Feu vert' || med.status === 'Apte avec réserve' || med.status === 'Apte') backendStatus = 'Apte';

  const numericMemberId = Number(med.playerId) || memberId || 1;

  return {
    member: numericMemberId,
    member_id: numericMemberId,
    injury_type: med.injuryType || 'Blessure',
    body_part: med.bodyPart || 'Membre inférieur',
    injury_date: med.injuryDate || new Date().toISOString().split('T')[0],
    expected_return_date: med.estimatedReturnDate || null,
    status: backendStatus,
    doctor_notes: med.physioNotes || med.prescribedCare || '',
    return_clearance_certified: med.doctorCleared ?? false,
  };
}

export const medicalService = {
  /**
   * Récupère la liste des dossiers médicaux du club depuis le backend
   */
  async getMedicalRecords(clubId = 1): Promise<MedicalRecord[]> {
    const data = await apiFetch<BackendMedicalRecord[]>(`/sport/medical/records/?club_id=${clubId}`);
    return data.map(mapBackendMedicalRecordToFrontend);
  },

  /**
   * Crée un nouveau dossier médical dans le backend
   */
  async createMedicalRecord(record: Partial<MedicalRecord>, clubId = 1): Promise<MedicalRecord> {
    const payload = mapFrontendMedicalRecordToBackend(record, Number(record.playerId) || 1, clubId);
    const data = await apiFetch<BackendMedicalRecord>('/sport/medical/records/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapBackendMedicalRecordToFrontend(data);
  },

  /**
   * Met à jour un dossier médical existant
   */
  async updateMedicalRecord(id: string | number, record: Partial<MedicalRecord>): Promise<MedicalRecord> {
    const payload = mapFrontendMedicalRecordToBackend(record, Number(record.playerId) || 1);
    const data = await apiFetch<BackendMedicalRecord>(`/sport/medical/records/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return mapBackendMedicalRecordToFrontend(data);
  },

  /**
   * Supprime un dossier médical
   */
  async deleteMedicalRecord(id: string | number): Promise<void> {
    await apiFetch(`/sport/medical/records/${id}/`, {
      method: 'DELETE',
    });
  },
};
