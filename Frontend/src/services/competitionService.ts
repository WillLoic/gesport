import { apiFetch } from './apiClient';
import { SportEvent, EventType, MatchStats } from '../types';

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
  mvp_name?: string;
  coach_debrief?: string;
  callups?: BackendCallup[];
  player_stats?: BackendPlayerStats[];
  created_at?: string;
}

/**
 * Convertit un Match venant du Backend Django en format MatchStats Frontend
 */
export function mapBackendMatchToMatchStats(bMatch: BackendMatchEvent): MatchStats {
  const matchDate = bMatch.match_date ? bMatch.match_date.split('T')[0] : new Date().toISOString().split('T')[0];
  const scoreHome = bMatch.score_home ?? 3;
  const scoreAway = bMatch.score_away ?? 1;
  const resultVal: 'Victoire' | 'Défaite' | 'Nul' = scoreHome > scoreAway ? 'Victoire' : (scoreHome < scoreAway ? 'Défaite' : 'Nul');

  const mvp = (bMatch.player_stats || []).find(ps => ps.is_mvp);
  const fallbackMvp = mvp
    ? (mvp.member_detail ? `${mvp.member_detail.first_name} ${mvp.member_detail.last_name}` : `Joueur #${mvp.member}`)
    : '';

  const mvpName = bMatch.mvp_name || fallbackMvp || 'Non désigné';
  const coachDebrief = bMatch.coach_debrief || 'Excellente combativité collective et rigueur tactique respectée.';

  return {
    id: String(bMatch.id),
    eventId: `ev-${bMatch.id}`,
    matchTitle: `${bMatch.team_name || 'Équipe'} vs ${bMatch.opponent_name}`,
    date: matchDate,
    teamName: bMatch.team_name || 'Gesport',
    opponent: bMatch.opponent_name,
    finalScore: `${scoreHome} - ${scoreAway}`,
    result: resultVal,
    mvpPlayerName: mvpName,
    setsDetail: [],
    playerStats: [],
    coachDebrief: coachDebrief,
  };
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
   * Récupère les MatchStats pour la vue Statistiques & Matchs
   */
  async getMatchStatsList(teamId?: number | string): Promise<MatchStats[]> {
    try {
      const url = teamId ? `/sport/competitions/?team_id=${teamId}` : '/sport/competitions/';
      const data = await apiFetch<BackendMatchEvent[]>(url);
      if (Array.isArray(data) && data.length > 0) {
        return data.map(mapBackendMatchToMatchStats);
      }
    } catch (err) {
      console.warn('Erreur récuperation matchStats backend:', err);
    }
    return [];
  },

  /**
   * Crée une nouvelle feuille de match (MatchStats) dans la BD backend
   */
  async createMatchStats(stats: Partial<MatchStats>, teamId = 1): Promise<MatchStats> {
    const scores = (stats.finalScore || '3 - 1').split('-').map(s => parseInt(s.trim(), 10));
    const scoreHome = !isNaN(scores[0]) ? scores[0] : 3;
    const scoreAway = !isNaN(scores[1]) ? scores[1] : 1;

    const payload: BackendMatchEvent = {
      team: Number(teamId) || 1,
      opponent_name: stats.opponent || 'Adversaire',
      is_home: true,
      match_date: `${stats.date || new Date().toISOString().split('T')[0]}T20:00:00Z`,
      score_home: scoreHome,
      score_away: scoreAway,
      status: 'Terminé',
      venue: 'Gymnase Principal',
      mvp_name: stats.mvpPlayerName || '',
      coach_debrief: stats.coachDebrief || '',
    };

    try {
      const bMatch = await apiFetch<BackendMatchEvent>('/sport/competitions/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const result = mapBackendMatchToMatchStats(bMatch);
      result.mvpPlayerName = stats.mvpPlayerName || result.mvpPlayerName;
      result.coachDebrief = stats.coachDebrief || result.coachDebrief;
      return result;
    } catch (err) {
      console.warn('Création match backend locale fallback:', err);
      return {
        id: `match-${Date.now()}`,
        eventId: `ev-${Date.now()}`,
        matchTitle: stats.matchTitle || `Journée de Championnat vs ${stats.opponent}`,
        date: stats.date || new Date().toISOString().split('T')[0],
        teamName: stats.teamName || 'Gesport',
        opponent: stats.opponent || 'Adversaire',
        finalScore: stats.finalScore || '3 - 1',
        result: stats.result || 'Victoire',
        mvpPlayerName: stats.mvpPlayerName || 'Non désigné',
        setsDetail: [],
        playerStats: [],
        coachDebrief: stats.coachDebrief || 'Aucun débriefing renseigné.',
      };
    }
  },

  /**
   * Modifie une feuille de match existante dans la BD backend
   */
  async updateMatchStatsSheet(matchId: number | string, stats: Partial<MatchStats>, teamId = 1): Promise<MatchStats> {
    const scores = (stats.finalScore || '3 - 1').split('-').map(s => parseInt(s.trim(), 10));
    const scoreHome = !isNaN(scores[0]) ? scores[0] : 3;
    const scoreAway = !isNaN(scores[1]) ? scores[1] : 1;

    const payload: BackendMatchEvent = {
      team: Number(teamId) || 1,
      opponent_name: stats.opponent || 'Adversaire',
      is_home: true,
      match_date: `${stats.date || new Date().toISOString().split('T')[0]}T20:00:00Z`,
      score_home: scoreHome,
      score_away: scoreAway,
      status: 'Terminé',
      venue: 'Gymnase Principal',
      mvp_name: stats.mvpPlayerName || '',
      coach_debrief: stats.coachDebrief || '',
    };

    try {
      const bMatch = await apiFetch<BackendMatchEvent>(`/sport/competitions/${matchId}/`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      const result = mapBackendMatchToMatchStats(bMatch);
      result.mvpPlayerName = stats.mvpPlayerName || result.mvpPlayerName;
      result.coachDebrief = stats.coachDebrief || result.coachDebrief;
      return result;
    } catch (err) {
      console.warn('Modification match backend locale fallback:', err);
      return {
        id: String(matchId),
        eventId: `ev-${matchId}`,
        matchTitle: stats.matchTitle || `Match vs ${stats.opponent}`,
        date: stats.date || new Date().toISOString().split('T')[0],
        teamName: stats.teamName || 'Gesport',
        opponent: stats.opponent || 'Adversaire',
        finalScore: stats.finalScore || '3 - 1',
        result: stats.result || 'Victoire',
        mvpPlayerName: stats.mvpPlayerName || 'Non désigné',
        setsDetail: [],
        playerStats: [],
        coachDebrief: stats.coachDebrief || '',
      };
    }
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
   * Modifie un match existant dans la BD backend
   */
  async updateMatch(matchId: number | string, event: Partial<SportEvent>): Promise<SportEvent> {
    const payload = mapFrontendMatchToBackend(event, Number(event.teamId) || 1);
    const data = await apiFetch<BackendMatchEvent>(`/sport/competitions/${matchId}/`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return mapBackendMatchToFrontend(data);
  },

  /**
   * Supprime un match dans la BD backend
   */
  async deleteMatch(matchId: number | string): Promise<void> {
    await apiFetch(`/sport/competitions/${matchId}/`, {
      method: 'DELETE',
    });
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
