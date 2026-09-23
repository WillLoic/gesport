import { apiFetch } from './apiClient';
import { Member, SportCategory, LicenseStatus } from '../types';

export interface BackendMember {
  id?: number;
  club_id: number;
  user_id?: number | null;
  first_name: string;
  last_name: string;
  full_name?: string;
  email: string;
  phone?: string;
  gender?: 'M' | 'F';
  birth_date?: string | null;
  sport_type?: string;
  category?: string;
  license_number?: string;
  license_status?: string;
  medical_cert_valid?: boolean;
  medical_cert_date?: string | null;
  jersey_number?: number | null;
  position?: string;
  gross_monthly_salary?: number | null;
  daily_salary?: number | null;
  cotisation_amount?: number | null;
  cotisation_paid?: number | null;
  teams?: { team_id: number; team_name: string; jersey_number?: number; position?: string }[];
  created_at?: string;
}

/**
 * Convertit un Membre venant du Backend Django en format Membre Frontend
 */
export function mapBackendMemberToFrontend(bMember: BackendMember): Member {
  const primaryTeam = bMember.teams && bMember.teams.length > 0 ? bMember.teams[0] : null;
  const position = bMember.position || primaryTeam?.position || 'Joueur';
  const jerseyNumber = bMember.jersey_number ?? primaryTeam?.jersey_number ?? 10;
  const teamId = primaryTeam ? String(primaryTeam.team_id) : '';
  const teamName = primaryTeam ? primaryTeam.team_name : 'Sans équipe';
  const amountDue = bMember.cotisation_amount != null ? Number(bMember.cotisation_amount) : 290;
  const amountPaid = bMember.cotisation_paid != null ? Number(bMember.cotisation_paid) : 290;

  return {
    id: String(bMember.id),
    firstName: bMember.first_name,
    lastName: bMember.last_name,
    email: bMember.email,
    phone: bMember.phone || '',
    gender: (bMember.gender as 'M' | 'F') || 'M',
    birthDate: bMember.birth_date || '2000-01-01',
    category: (bMember.category as SportCategory) || 'Senior Régionale',
    teamId: teamId,
    teamName: teamName,
    licenseNumber: bMember.license_number || '',
    licenseStatus: (bMember.license_status as LicenseStatus) || 'Validée',
    season: '2024-2025',
    medicalCertDate: bMember.medical_cert_date || new Date().toISOString().split('T')[0],
    medicalCertValid: bMember.medical_cert_valid ?? true,
    position: position,
    jerseyNumber: jerseyNumber,
    paymentStatus: amountPaid >= amountDue ? 'À jour' : (amountPaid > 0 ? 'Échelonné' : 'En attente'),
    amountDue: amountDue,
    amountPaid: amountPaid,
    grossMonthlySalary: bMember.gross_monthly_salary != null ? Number(bMember.gross_monthly_salary) : undefined,
    dailySalary: bMember.daily_salary != null ? Number(bMember.daily_salary) : undefined,
    emergencyContact: {
      name: "Contact d'urgence",
      phone: bMember.phone || '',
      relation: 'Parent / Proche',
    },
    address: 'Métropole',
  };
}

/**
 * Convertit un Membre Frontend vers le format JSON attendu par la REST API Django
 */
export function mapFrontendMemberToBackend(member: Partial<Member>, clubId = 1, sportType = 'football'): BackendMember {
  return {
    club_id: clubId,
    user_id: null,
    first_name: member.firstName || '',
    last_name: member.lastName || '',
    email: member.email || '',
    phone: member.phone || '',
    gender: member.gender || 'M',
    birth_date: member.birthDate || '2001-01-01',
    sport_type: sportType,
    category: member.category || 'Senior Régionale',
    license_number: member.licenseNumber || '',
    license_status: member.licenseStatus || 'Validée',
    medical_cert_valid: member.medicalCertValid ?? true,
    medical_cert_date: member.medicalCertDate || new Date().toISOString().split('T')[0],
    jersey_number: member.jerseyNumber ?? null,
    position: member.position || '',
    gross_monthly_salary: member.grossMonthlySalary ?? null,
    daily_salary: member.dailySalary ?? null,
    cotisation_amount: member.amountDue ?? 0,
    cotisation_paid: member.amountPaid ?? 0,
  };
}

export const memberService = {
  /**
   * Récupère la liste des membres pour un club donné
   */
  async getMembers(clubId = 1): Promise<Member[]> {
    const data = await apiFetch<BackendMember[]>(`/sport/membres/?club_id=${clubId}`);
    return data.map(mapBackendMemberToFrontend);
  },

  /**
   * Crée un membre dans la BD backend
   */
  async createMember(member: Partial<Member>, clubId = 1, sportType = 'football'): Promise<Member> {
    const payload = mapFrontendMemberToBackend(member, clubId, sportType);
    const data = await apiFetch<BackendMember>('/sport/membres/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapBackendMemberToFrontend(data);
  },

  /**
   * Met à jour un membre existant
   */
  async updateMember(id: number | string, member: Partial<Member>, clubId = 1, sportType = 'football'): Promise<Member> {
    const payload = mapFrontendMemberToBackend(member, clubId, sportType);
    const data = await apiFetch<BackendMember>(`/sport/membres/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return mapBackendMemberToFrontend(data);
  },

  /**
   * Supprime un membre
   */
  async deleteMember(id: number | string): Promise<void> {
    await apiFetch(`/sport/membres/${id}/`, {
      method: 'DELETE',
    });
  },
};
