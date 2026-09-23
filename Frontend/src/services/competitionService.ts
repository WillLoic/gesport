import { apiFetch } from './apiClient';
import { SportEvent, EventType } from '../types';

export interface BackendCallup {
  id?: number;
  match?: number;
  member: number;
  member_detail?: any;
  status?: string;
  notes?: string;
  created_at?: string;
}

export interface BackendPlayerStats {
  id?: number;
  match?: number;
  member: number;
  member_detail?: any;
  points?: number;
  assists?: number;
  rebounds?: number;
  fouls?: number;
  rating?: number;
  is_mvp?: boolean;
}

export interface BackendMatchEvent {
  id?: number;
  team: number;
  team_name?: string;
  opponent_name: string;
  is_home?: boolean;
  match_date: string;
  venue?: string;
  score_home?: number | null;
  score_away?: number | null;
  status?: string;
  callups?: BackendCallup[];
  player_stats?: BackendPlayerStats[];
  created_at?: string;
}

/**
 * Convertit un Match venant du Backend Django en format SportEvent Frontend
 */
export function mapBackendMatchToFrontend(bMatch: BackendMatchEvent): SportEvent {
  const matchDate = bMatch.match_date ? bMatch.match_date.split('T')[0] : new Date().toISOString().split('T')[0];
  const matchTime = bMatch.match_date && bMatch.match_date.includes('T')
    ? bMatch.match_date.split('T')[1].substring(0, 5)
    : '20:00';

  const summonedPlayers = (bMatch.callups || []).map(c => ({
    playerId: String(c.member),
    playerName: c.member_detail ? `${c.member_detail.first_name} ${c.member_detail.last_name}` : `Joueur #${c.member}`,
    status: (c.status === 'Présent' ? 'Confirmé' : c.status === 'Absent' ? 'Absent' : 'En attente') as any,
    transport: 'Voiture perso' as const,
  }));

  const statusMap: Record<string, 'Programmé' | 'En cours' | 'Terminé' | 'Reporté' | 'Annulé'> = {
    'A venir': 'Programmé',
    'En cours': 'En cours',
    'Terminé': 'Terminé',
    'Reporté': 'Reporté',
    'Annulé': 'Annulé',
  };

  return {
    id: String(bMatch.id),
    title: `Match ${bMatch.team_name || 'Équipe'} ${bMatch.is_home ? 'VS' : '@'} ${bMatch.opponent_name}`,
    type: 'match_official' as EventType,
    teamId: String(bMatch.team),
    teamName: bMatch.team_name || 'Équipe Principale',
    opponent: bMatch.opponent_name,
    isHome: bMatch.is_home ?? true,
    date: matchDate,
    startTime: matchTime,
    endTime: '22:00',
    convocationTime: '18:45',
    location: bMatch.venue || 'Gymnase du Club',
    hall: 'Terrain A',
    status: statusMap[bMatch.status || 'A venir'] || 'Programmé',
    score: (bMatch.score_home !== null && bMatch.score_away !== null) ? {
      home: bMatch.score_home || 0,
      away: bMatch.score_away || 0,
    } : undefined,
    summonedPlayers: summonedPlayers,
  };
}

/**
 * Convertit un SportEvent Frontend vers le format JSON attendu par l'API Django
 */
export function mapFrontendMatchToBackend(event: Partial<SportEvent>, teamId = 1): BackendMatchEvent {
  const dateStr = event.date || new Date().toISOString().split('T')[0];
  const timeStr = event.startTime || '20:00';
  const matchDateTime = `${dateStr}T${timeStr}:00Z`;

  return {
    team: Number(event.teamId) || teamId,
    opponent_name: event.opponent || event.title || 'Adversaire',
    is_home: event.isHome ?? true,
    match_date: matchDateTime,
    venue: event.location || 'Gymnase Municipal',
    score_home: event.score ? event.score.home : null,
    score_away: event.score ? event.score.away : null,
    status: event.status === 'Programmé' ? 'A venir' : event.status || 'A venir',
  };
}

export const competitionService = {
  /**
   * Récupère les matchs pour une équipe donnée
   */
  async getMatches(teamId = 1): Promise<SportEvent[]> {
    const data = await apiFetch<BackendMatchEvent[]>(`/sport/competitions/?team_id=${teamId}`);
    return data.map(mapBackendMatchToFrontend);
  },

  /**
   * Crée un nouveau match dans la BD backend
   */
  async createMatch(event: Partial<SportEvent>, teamId = 1): Promise<SportEvent> {
    const payload = mapFrontendMatchToBackend(event, teamId);
    const data = await apiFetch<BackendMatchEvent>('/sport/competitions/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapBackendMatchToFrontend(data);
  },

  /**
   * Ajoute une convocation de joueur pour un match
   */
  async addCallup(matchId: number | string, memberId: number | string, status = 'Convoqué', notes = ''): Promise<void> {
    await apiFetch(`/sport/competitions/${matchId}/callup/`, {
      method: 'POST',
      body: JSON.stringify({
        match: Number(matchId),
        member: Number(memberId),
        status: status,
        notes: notes,
      }),
    });
  },

  /**
   * Met à jour les statistiques individuelles d'un joueur pour un match
   */
  async updateMatchStats(
    matchId: number | string,
    memberId: number | string,
    stats: { points?: number; assists?: number; rebounds?: number; fouls?: number; rating?: number; is_mvp?: boolean }
  ): Promise<void> {
    await apiFetch(`/sport/competitions/${matchId}/stats/`, {
      method: 'POST',
      body: JSON.stringify({
        match: Number(matchId),
        member: Number(memberId),
        ...stats,
      }),
    });
  },
};
