import { apiFetch } from './apiClient';
import { TalentCandidate } from '../types';

export interface BackendTalentProspect {
  id: number;
  club_id: number;
  first_name: string;
  last_name: string;
  birth_year: number;
  sport_type: string;
  position: string;
  current_club: string;
  overall_rating: number;
  radar_scores_json: Record<string, number>;
  status: string;
  scout_notes: string;
  height_cm?: number;
  category_target?: string;
  contact_phone?: string;
  trial_date?: string;
  created_at?: string;
}

export function mapBackendProspectToFrontend(b: BackendTalentProspect): TalentCandidate {
  const currentYear = new Date().getFullYear();
  const age = b.birth_year ? currentYear - b.birth_year : 20;

  const defaultRadar = {
    technique: 8,
    physique: 8,
    tactique: 8,
    mental: 8,
    collectif: 8,
  };

  const radar = { ...defaultRadar, ...(b.radar_scores_json || {}) };

  return {
    id: String(b.id),
    fullName: `${b.first_name || ''} ${b.last_name || ''}`.trim() || 'Prospect Anonyme',
    currentClub: b.current_club || 'Club Libre',
    age,
    position: b.position || 'Joueur Polyvalent',
    heightCm: b.height_cm || 188,
    categoryTarget: (b.category_target || 'Nationale 1 Masculine') as any,
    stage: (b.status || 'Prospecté') as any,
    skillsRadar: radar,
    scoutReport: b.scout_notes || 'Aucun rapport rédigé pour le moment.',
    contactPhone: b.contact_phone || '06 00 00 00 00',
    trialDate: b.trial_date || undefined,
  };
}

export function mapFrontendCandidateToBackend(f: Partial<TalentCandidate>): Partial<BackendTalentProspect> {
  const nameParts = (f.fullName || '').trim().split(' ');
  const firstName = nameParts[0] || 'Prospect';
  const lastName = nameParts.slice(1).join(' ') || '';
  const currentYear = new Date().getFullYear();
  const birthYear = f.age ? currentYear - f.age : 2004;

  return {
    first_name: firstName,
    last_name: lastName,
    birth_year: birthYear,
    position: f.position || 'Joueur Polyvalent',
    current_club: f.currentClub || 'Club Libre',
    status: f.stage || 'Prospecté',
    scout_notes: f.scoutReport || '',
    radar_scores_json: f.skillsRadar || { technique: 8, physique: 8, tactique: 8, mental: 8, collectif: 8 },
    height_cm: f.heightCm || 188,
    category_target: f.categoryTarget || 'Nationale 1 Masculine',
    contact_phone: f.contactPhone || '',
    trial_date: f.trialDate || '',
    club_id: 1,
  };
}

export const recruitmentService = {
  async getProspects(clubId: number = 1): Promise<TalentCandidate[]> {
    const data = await apiFetch<BackendTalentProspect[]>(`/sport/recruitment/prospects/?club_id=${clubId}`);
    return data.map(mapBackendProspectToFrontend);
  },

  async createOrUpdateProspect(prospect: Partial<TalentCandidate>): Promise<TalentCandidate> {
    const payload = mapFrontendCandidateToBackend(prospect);
    const isUpdate = prospect.id && !prospect.id.startsWith('talent-');

    if (isUpdate) {
      const data = await apiFetch<BackendTalentProspect>(`/sport/recruitment/prospects/${prospect.id}/`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      return mapBackendProspectToFrontend(data);
    }

    const data = await apiFetch<BackendTalentProspect>('/sport/recruitment/prospects/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapBackendProspectToFrontend(data);
  },

  async deleteProspect(id: string): Promise<void> {
    if (id.startsWith('talent-')) return;
    await apiFetch(`/sport/recruitment/prospects/${id}/`, {
      method: 'DELETE',
    });
  },
};
