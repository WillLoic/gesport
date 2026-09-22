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
  created_at?: string;
}

/**
 * Convertit un Membre venant du Backend Django en format Membre Frontend
 */
export function mapBackendMemberToFrontend(bMember: BackendMember): Member {
  return {
    id: String(bMember.id),
    firstName: bMember.first_name,
    lastName: bMember.last_name,
    email: bMember.email,
    phone: bMember.phone || '06 00 00 00 00',
    gender: (bMember.gender as 'M' | 'F') || 'M',
    birthDate: bMember.birth_date || '2000-01-01',
    category: (bMember.category as SportCategory) || 'Senior Régionale',
    teamId: 't1',
    teamName: 'Équipe Principale',
    licenseNumber: bMember.license_number || `LIC-${bMember.id || 100}`,
    licenseStatus: (bMember.license_status as LicenseStatus) || 'Validée',
    season: '2024-2025',
    medicalCertDate: bMember.medical_cert_date || new Date().toISOString().split('T')[0],
    medicalCertValid: bMember.medical_cert_valid ?? true,
    position: 'Joueur',
    jerseyNumber: 10,
    paymentStatus: 'À jour',
    amountDue: 290,
    amountPaid: 290,
    emergencyContact: {
      name: "Contact d'urgence",
      phone: '06 00 00 00 00',
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
    license_number: member.licenseNumber || `LIC-${Math.floor(100000 + Math.random() * 900000)}`,
    license_status: member.licenseStatus || 'Validée',
    medical_cert_valid: member.medicalCertValid ?? true,
    medical_cert_date: member.medicalCertDate || new Date().toISOString().split('T')[0],
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
