import { apiFetch } from './apiClient';
import { TrainingExercise, TrainingSession } from '../types';

export interface BackendTrainingExercise {
  id?: number;
  club_id?: number;
  title: string;
  sport_type?: string;
  category?: string;
  duration_minutes?: number;
  intensity?: string;
  description?: string;
  instructions_json?: string[];
  diagram_data?: any;
  created_at?: string;
}

export interface BackendTrainingSession {
  id?: number;
  team: number;
  team_name?: string;
  title: string;
  session_date: string;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  coach_name?: string;
  theme?: string;
  intensity?: string;
  exercises?: number[];
  exercises_detail?: BackendTrainingExercise[];
  attendance_count?: number;
  total_summoned?: number;
  coach_feedback?: string;
  created_at?: string;
}

/**
 * Convertit un exercice venant du backend Django vers le format Frontend
 */
export function mapBackendExerciseToFrontend(bEx: BackendTrainingExercise): TrainingExercise {
  return {
    id: String(bEx.id),
    title: bEx.title,
    category: bEx.category || 'Physique / Cardio',
    durationMinutes: bEx.duration_minutes || 15,
    intensity: (bEx.intensity as any) || 'Moyenne',
    description: bEx.description || '',
    instructions: (bEx.instructions_json && bEx.instructions_json.length > 0)
      ? bEx.instructions_json
      : ['Consigne 1 : Échauffement et répétition des gammes', 'Consigne 2 : Maintien de l\'intensité et replacement rapide'],
    tags: [bEx.category || 'Exercice', bEx.sport_type || 'Général'],
  };
}

/**
 * Convertit un exercice Frontend vers le format JSON backend Django
 */
export function mapFrontendExerciseToBackend(ex: Partial<TrainingExercise>, clubId = 1): BackendTrainingExercise {
  return {
    club_id: clubId,
    title: ex.title || 'Nouvel Exercice',
    sport_type: ex.sportId || 'volleyball',
    category: ex.category || 'Technique',
    duration_minutes: ex.durationMinutes || 15,
    intensity: ex.intensity || 'Moyenne',
    description: ex.description || '',
    instructions_json: ex.instructions || [],
  };
}

/**
 * Convertit une séance d'entraînement backend Django vers le format Frontend
 */
export function mapBackendSessionToFrontend(bSess: BackendTrainingSession): TrainingSession {
  const sessionDate = bSess.session_date ? bSess.session_date.split('T')[0] : new Date().toISOString().split('T')[0];
  const exercises = (bSess.exercises_detail || []).map(mapBackendExerciseToFrontend);

  return {
    id: String(bSess.id),
    teamId: String(bSess.team),
    teamName: bSess.team_name || 'Équipe 1',
    title: bSess.title,
    date: sessionDate,
    startTime: bSess.start_time || '19:00',
    endTime: bSess.end_time || '21:00',
    coachName: bSess.coach_name || 'Coach Principal',
    theme: bSess.theme || 'Perfectionnement Technique',
    intensity: (bSess.intensity as any) || 'Moyenne',
    exercises: exercises,
    attendanceCount: bSess.attendance_count ?? 12,
    totalSummoned: bSess.total_summoned ?? 14,
    coachFeedback: bSess.coach_feedback || undefined,
  };
}

/**
 * Convertit une séance Frontend vers le format JSON backend Django
 */
export function mapFrontendSessionToBackend(session: Partial<TrainingSession>, teamId = 1): BackendTrainingSession {
  const dateStr = session.date || new Date().toISOString().split('T')[0];
  const timeStr = session.startTime || '19:00';
  const sessionDateTime = `${dateStr}T${timeStr}:00Z`;

  return {
    team: Number(session.teamId) || teamId,
    title: session.title || 'Séance d\'entraînement',
    session_date: sessionDateTime,
    start_time: session.startTime || '19:00',
    end_time: session.endTime || '21:00',
    coach_name: session.coachName || 'Coach Principal',
    theme: session.theme || 'Perfectionnement Technique',
    intensity: session.intensity || 'Moyenne',
    attendance_count: session.attendanceCount ?? 12,
    total_summoned: session.totalSummoned ?? 14,
    coach_feedback: session.coachFeedback || '',
    exercises: (session.exercises || []).map(e => Number(e.id)).filter(id => !isNaN(id)),
  };
}

export const tacticsService = {
  /**
   * Récupère la liste des exercices du club depuis le backend
   */
  async getExercises(clubId = 1): Promise<TrainingExercise[]> {
    const data = await apiFetch<BackendTrainingExercise[]>(`/sport/tactics/exercises/?club_id=${clubId}`);
    return data.map(mapBackendExerciseToFrontend);
  },

  /**
   * Crée un nouvel exercice dans le backend
   */
  async createExercise(exercise: Partial<TrainingExercise>, clubId = 1): Promise<TrainingExercise> {
    const payload = mapFrontendExerciseToBackend(exercise, clubId);
    const data = await apiFetch<BackendTrainingExercise>('/sport/tactics/exercises/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapBackendExerciseToFrontend(data);
  },

  /**
   * Modifie un exercice existant
   */
  async updateExercise(id: string | number, exercise: Partial<TrainingExercise>): Promise<TrainingExercise> {
    const payload = mapFrontendExerciseToBackend(exercise);
    const data = await apiFetch<BackendTrainingExercise>(`/sport/tactics/exercises/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return mapBackendExerciseToFrontend(data);
  },

  /**
   * Supprime un exercice
   */
  async deleteExercise(id: string | number): Promise<void> {
    await apiFetch(`/sport/tactics/exercises/${id}/`, {
      method: 'DELETE',
    });
  },

  /**
   * Récupère les séances d'entraînement d'une équipe depuis le backend
   */
  async getSessions(teamId = 1): Promise<TrainingSession[]> {
    const data = await apiFetch<BackendTrainingSession[]>(`/sport/tactics/sessions/?team_id=${teamId}`);
    return data.map(mapBackendSessionToFrontend);
  },

  /**
   * Crée une nouvelle séance d'entraînement dans le backend
   */
  async createSession(session: Partial<TrainingSession>, teamId = 1): Promise<TrainingSession> {
    const payload = mapFrontendSessionToBackend(session, teamId);
    const data = await apiFetch<BackendTrainingSession>('/sport/tactics/sessions/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapBackendSessionToFrontend(data);
  },

  /**
   * Modifie une séance d'entraînement existante
   */
  async updateSession(id: string | number, session: Partial<TrainingSession>): Promise<TrainingSession> {
    const payload = mapFrontendSessionToBackend(session, Number(session.teamId) || 1);
    const data = await apiFetch<BackendTrainingSession>(`/sport/tactics/sessions/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return mapBackendSessionToFrontend(data);
  },

  /**
   * Supprime une séance d'entraînement
   */
  async deleteSession(id: string | number): Promise<void> {
    await apiFetch(`/sport/tactics/sessions/${id}/`, {
      method: 'DELETE',
    });
  },
};
