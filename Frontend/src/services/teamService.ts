import { apiFetch } from './apiClient';
import { Team, SportCategory } from '../types';

export interface BackendTeamPlayer {
  id?: number;
  jersey_number?: number | null;
  position?: string;
  member: number;
  member_detail?: any;
  joined_at?: string;
}

export interface BackendTeam {
  id?: number;
  club_id: number;
  name: string;
  sport_type?: string;
  category?: string;
  head_coach_name?: string;
  head_coach_id?: number | null;
  players?: BackendTeamPlayer[];
  players_count?: number;
  created_at?: string;
}

/**
 * Convertit une Équipe venant du Backend Django en format Team Frontend
 */
export function mapBackendTeamToFrontend(bTeam: BackendTeam): Team {
  const playerIds = bTeam.players
    ? bTeam.players.map(p => String(p.member))
    : [];

  return {
    id: String(bTeam.id),
    name: bTeam.name,
    category: (bTeam.category as SportCategory) || 'Senior Régionale',
    division: 'Régionale 1',
    coachId: String(bTeam.head_coach_id || 'c1'),
    coachName: bTeam.head_coach_name || 'Entraîneur Principal',
    assistantCoach: 'Adjoint Pôle',
    playerIds: playerIds,
    ranking: 1,
    playedMatches: 0,
    wins: 0,
    losses: 0,
    points: 0,
    trainingDays: 'Mar & Jeu • 19:30',
    hallName: 'Gymnase Principal',
    colorHex: '#2563eb',
  };
}

/**
 * Convertit une Équipe Frontend vers le format JSON attendu par l'API Django
 */
export function mapFrontendTeamToBackend(team: Partial<Team>, clubId = 1, sportType = 'football'): BackendTeam {
  return {
    club_id: clubId,
    name: team.name || 'Nouvelle Équipe',
    sport_type: sportType,
    category: team.category || 'Senior Régionale',
    head_coach_name: team.coachName || '',
    head_coach_id: null,
  };
}

export const teamService = {
  /**
   * Récupère la liste des équipes pour un club donné
   */
  async getTeams(clubId = 1): Promise<Team[]> {
    const data = await apiFetch<BackendTeam[]>(`/sport/teams/?club_id=${clubId}`);
    return data.map(mapBackendTeamToFrontend);
  },

  /**
   * Crée une nouvelle équipe dans la BD backend
   */
  async createTeam(team: Partial<Team>, clubId = 1, sportType = 'football'): Promise<Team> {
    const payload = mapFrontendTeamToBackend(team, clubId, sportType);
    const data = await apiFetch<BackendTeam>('/sport/teams/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapBackendTeamToFrontend(data);
  },

  /**
   * Ajoute un joueur (membre) à une équipe
   */
  async addPlayerToTeam(
    teamId: number | string,
    memberId: number | string,
    jerseyNumber?: number,
    position?: string
  ): Promise<void> {
    await apiFetch(`/sport/teams/${teamId}/players/`, {
      method: 'POST',
      body: JSON.stringify({
        member_id: Number(memberId),
        jersey_number: jerseyNumber ?? null,
        position: position || '',
      }),
    });
  },

  /**
   * Retire un joueur d'une équipe
   */
  async removePlayerFromTeam(
    teamId: number | string,
    memberId: number | string
  ): Promise<void> {
    await apiFetch(`/sport/teams/${teamId}/players/`, {
      method: 'DELETE',
      body: JSON.stringify({
        member_id: Number(memberId),
      }),
    });
  },
};
