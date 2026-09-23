import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Plus,
  Clock,
  Flame,
  CheckCircle,
  Play,
  Layers,
  Sparkles,
  ChevronRight,
  BookOpen,
  X,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { TrainingExercise, TrainingSession } from '../../types';
import { SportTacticalPitch } from '../common/SportTacticalPitch';
import { tacticsService } from '../../services/tacticsService';

export const TrainingsView: React.FC = () => {
  const { exercises, setExercises, trainings, setTrainings, teams, currentSport, currentSportConfig, showToast } = useClub();

  const [activeTab, setActiveTab] = useState<'sessions' | 'exercises'>('sessions');
  const [selectedExercise, setSelectedExercise] = useState<TrainingExercise | null>(exercises[0] || null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  
  // Session Form States
  const [isCreateTrainingModalOpen, setIsCreateTrainingModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newTeamId, setNewTeamId] = useState(teams[0]?.id || 't1');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStartTime, setNewStartTime] = useState('19:00');
  const [newEndTime, setNewEndTime] = useState('21:00');
  const [newCoachName, setNewCoachName] = useState('Coach Principal');
  const [newTheme, setNewTheme] = useState('Perfectionnement Tactique & Phases de Jeu');
  const [newFeedback, setNewFeedback] = useState('');

  // Exercise Form States
  const [isCreateExerciseModalOpen, setIsCreateExerciseModalOpen] = useState(false);
  const [newExTitle, setNewExTitle] = useState('');
  const [newExCategory, setNewExCategory] = useState('Technique');
  const [newExDuration, setNewExDuration] = useState(15);
  const [newExIntensity, setNewExIntensity] = useState<'Faible' | 'Moyenne' | 'Élevée'>('Moyenne');
  const [newExDescription, setNewExDescription] = useState('');
  const [newExInstruction, setNewExInstruction] = useState('');

  // Sync selected exercise when exercises or sport change
  useEffect(() => {
    if (exercises.length > 0) {
      setSelectedExercise(exercises[0]);
      setSelectedCategoryFilter('all');
    }
  }, [currentSport, exercises]);

  const filteredExercises = exercises.filter(ex => {
    if (selectedCategoryFilter === 'all' || selectedCategoryFilter === 'Toutes les catégories') return true;
    return ex.category === selectedCategoryFilter;
  });

  const openCreateSessionModal = () => {
    setEditingSession(null);
    setNewTitle('');
    setNewTeamId(teams[0]?.id || 't1');
    setNewDate(new Date().toISOString().split('T')[0]);
    setNewStartTime('19:00');
    setNewEndTime('21:00');
    setNewCoachName('Coach Principal');
    setNewTheme('Perfectionnement Tactique & Phases de Jeu');
    setNewFeedback('');
    setIsCreateTrainingModalOpen(true);
  };

  const openEditSessionModal = (session: TrainingSession, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingSession(session);
    setNewTitle(session.title);
    setNewTeamId(session.teamId || teams[0]?.id || 't1');
    setNewDate(session.date);
    setNewStartTime(session.startTime);
    setNewEndTime(session.endTime);
    setNewCoachName(session.coachName);
    setNewTheme(session.theme);
    setNewFeedback(session.coachFeedback || '');
    setIsCreateTrainingModalOpen(true);
  };

  const handleSaveTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Veuillez spécifier le titre de la séance.');
      return;
    }

    const assignedTeam = teams.find(t => t.id === newTeamId) || teams[0];
    const sessionData: Partial<TrainingSession> = {
      teamId: assignedTeam ? assignedTeam.id : 't1',
      teamName: assignedTeam ? assignedTeam.name : 'Équipe 1',
      title: newTitle.trim(),
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      coachName: newCoachName.trim() || 'Entraîneur',
      theme: newTheme.trim() || 'Perfectionnement Technique',
      intensity: 'Moyenne',
      exercises: exercises.slice(0, 3),
      attendanceCount: 12,
      totalSummoned: 14,
      coachFeedback: newFeedback.trim() || undefined,
    };

    if (editingSession) {
      try {
        const updated = await tacticsService.updateSession(editingSession.id, sessionData);
        const updatedSession = { ...editingSession, ...sessionData, id: editingSession.id } as TrainingSession;
        setTrainings(prev => prev.map(s => s.id === editingSession.id ? updatedSession : s));
        showToast(`Séance "${updatedSession.title}" mise à jour avec succès !`);
      } catch (err) {
        const updatedSession = { ...editingSession, ...sessionData, id: editingSession.id } as TrainingSession;
        setTrainings(prev => prev.map(s => s.id === editingSession.id ? updatedSession : s));
        showToast(`Séance "${updatedSession.title}" mise à jour !`);
      }
    } else {
      try {
        const createdSession = await tacticsService.createSession(sessionData, Number(assignedTeam?.id) || 1);
        setTrainings(prev => [createdSession, ...prev]);
        showToast(`Séance "${createdSession.title}" planifiée pour ${createdSession.teamName} !`);
      } catch (err: any) {
        const newSession: TrainingSession = {
          id: `train-${Date.now()}`,
          ...sessionData,
        } as TrainingSession;
        setTrainings(prev => [newSession, ...prev]);
        showToast(`Séance "${newSession.title}" planifiée !`);
      }
    }

    setIsCreateTrainingModalOpen(false);
    setEditingSession(null);
    setNewTitle('');
    setNewFeedback('');
  };

  const handleDeleteSession = async (sessionId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const sessionToDelete = trainings.find(s => s.id === sessionId);
    if (!sessionToDelete) return;

    if (!window.confirm(`Voulez-vous vraiment supprimer la séance "${sessionToDelete.title}" ?`)) {
      return;
    }

    try {
      await tacticsService.deleteSession(sessionId);
    } catch (err) {
      console.warn('Erreur suppression séance backend:', err);
    }

    setTrainings(prev => prev.filter(s => s.id !== sessionId));
    showToast(`Séance "${sessionToDelete.title}" supprimée avec succès !`);
  };

  const handleSaveExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExTitle.trim()) {
      showToast('Veuillez donner un nom à l\'exercice.');
      return;
    }

    const exData: Partial<TrainingExercise> = {
      title: newExTitle.trim(),
      category: newExCategory,
      durationMinutes: Number(newExDuration) || 15,
      intensity: newExIntensity,
      description: newExDescription.trim() || 'Exercice pratique sur le terrain.',
      instructions: newExInstruction.trim() ? [newExInstruction.trim()] : ['Consigne 1 : Respecter les placements', 'Consigne 2 : Maintien du rythme'],
      tags: [newExCategory, currentSport],
    };

    try {
      const createdEx = await tacticsService.createExercise(exData, 1);
      setExercises(prev => [createdEx, ...prev]);
      setSelectedExercise(createdEx);
      showToast(`Exercice "${createdEx.title}" ajouté à la bibliothèque !`);
    } catch (err) {
      const newEx: TrainingExercise = {
        id: `ex-${Date.now()}`,
        ...exData,
      } as TrainingExercise;
      setExercises(prev => [newEx, ...prev]);
      setSelectedExercise(newEx);
      showToast(`Exercice "${newEx.title}" ajouté !`);
    }

    setIsCreateExerciseModalOpen(false);
    setNewExTitle('');
    setNewExDescription('');
    setNewExInstruction('');
  };

  const handleDeleteExercise = async (exerciseId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const exToDelete = exercises.find(ex => ex.id === exerciseId);
    if (!exToDelete) return;

    if (!window.confirm(`Voulez-vous vraiment supprimer l'exercice "${exToDelete.title}" ?`)) {
      return;
    }

    try {
      await tacticsService.deleteExercise(exerciseId);
    } catch (err) {
      console.warn('Erreur suppression exercice backend:', err);
    }

    setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
    if (selectedExercise?.id === exerciseId) {
      const remaining = exercises.filter(ex => ex.id !== exerciseId);
      setSelectedExercise(remaining[0] || null);
    }
    showToast(`Exercice "${exToDelete.title}" supprimé avec succès !`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Entraînements & Schémas Tactiques</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Préparation des séances, bibliothèque d'exercices avec schémas de terrain et feedbacks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('sessions')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'sessions' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Séances Planifiées ({trainings.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('exercises')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'exercises' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bibliothèque d'Exercices ({exercises.length})
            </button>
          </div>

          <button
            type="button"
            onClick={openCreateSessionModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Séance
          </button>
        </div>
      </div>

      {/* Tab 1: Planned Sessions */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trainings.map(session => (
              <div
                key={session.id}
                className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition-all space-y-4 relative group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {session.teamName}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 mt-2">{session.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Entraîneur : <span className="font-semibold text-slate-700">{session.coachName}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900">{session.date}</span>
                      <p className="text-xs text-slate-400">{session.startTime} - {session.endTime}</p>
                    </div>

                    {/* Quick Edit & Delete Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => openEditSessionModal(session, e)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Modifier la séance"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Supprimer la séance"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
                  <p className="font-bold text-slate-800">Thème principal de la séance :</p>
                  <p className="text-slate-600">{session.theme}</p>
                </div>

                {/* Exercises flow list */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                    Déroulé de la séance ({session.exercises.length} blocs)
                  </h4>
                  <div className="space-y-1.5">
                    {session.exercises.map((ex, idx) => (
                      <div
                        key={ex.id || idx}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-slate-900">{ex.title}</span>
                        </div>
                        <span className="text-slate-500 font-semibold">{ex.durationMinutes} min</span>
                      </div>
                    ))}
                  </div>
                </div>

                {session.coachFeedback && (
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900">
                    <span className="font-bold">Débrief Coach : </span>
                    {session.coachFeedback}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Exercises Drill Library with Diagrams */}
      {activeTab === 'exercises' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exercises list (Left) */}
          <div className="lg:col-span-1 space-y-3">
            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2">
              <select
                value={selectedCategoryFilter}
                onChange={e => setSelectedCategoryFilter(e.target.value)}
                className="flex-1 text-xs font-semibold px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 outline-hidden"
              >
                {currentSportConfig.drillCategories.map((cat, idx) => (
                  <option key={idx} value={cat === 'Toutes les catégories' ? 'all' : cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setIsCreateExerciseModalOpen(true)}
                className="p-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1 cursor-pointer shrink-0"
                title="Ajouter un exercice"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {filteredExercises.map(ex => {
                const isSelected = selectedExercise?.id === ex.id;
                return (
                  <div
                    key={ex.id}
                    onClick={() => setSelectedExercise(ex)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-blue-600">{ex.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-semibold">{ex.durationMinutes} min</span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteExercise(ex.id, e)}
                          className="text-slate-300 hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
                          title="Supprimer l'exercice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">{ex.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ex.intensity === 'Élevée'
                            ? 'bg-rose-100 text-rose-800'
                            : ex.intensity === 'Moyenne'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        Intensité : {ex.intensity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Drill Diagram & Detailed Instructions (Right) */}
          <div className="lg:col-span-2">
            {selectedExercise ? (
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                      {selectedExercise.category}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      Durée : {selectedExercise.durationMinutes} minutes
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-2">{selectedExercise.title}</h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">{selectedExercise.description}</p>
                </div>

                {/* Tactical SVG Court / Pitch Visualizer for the current sport */}
                <div>
                  <SportTacticalPitch
                    sport={currentSport}
                    title={`Schéma Tactique de l'Exercice — ${currentSportConfig.name}`}
                    subtitle={selectedExercise.category}
                    positions={currentSportConfig.tacticalLineup}
                  />
                </div>

                {/* Step by step Instructions */}
                <div>
                  <h3 className="font-bold text-sm text-slate-900 mb-3">Instructions & Consignes Pédagogiques</h3>
                  <div className="space-y-2">
                    {(selectedExercise.instructions || []).map((inst, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <p>{inst}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-400">
                Sélectionnez un exercice pour consulter sa fiche détaillée.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Nouvelle / Modifier Séance d'Entraînement */}
      {isCreateTrainingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {editingSession ? "Modifier la Séance d'Entraînement" : "Préparer une Séance d'Entraînement"}
                </h3>
                <p className="text-xs text-slate-500">Planification pédagogique, thématique technique et choix des exercices</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreateTrainingModalOpen(false);
                  setEditingSession(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTraining} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Titre de la Séance *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Séance Perfectionnement Service & Relance Rapide"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Équipe</label>
                  <select
                    value={newTeamId}
                    onChange={e => setNewTeamId(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 outline-hidden"
                  >
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Entraîneur Responsable</label>
                  <input
                    type="text"
                    placeholder="Coach Principal"
                    value={newCoachName}
                    onChange={e => setNewCoachName(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Heure Début</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={e => setNewStartTime(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Heure Fin</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={e => setNewEndTime(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Objectif & Thématique</label>
                <input
                  type="text"
                  placeholder="Ex: Travail des trajectoires de passe et fixation bloc adverse"
                  value={newTheme}
                  onChange={e => setNewTheme(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Consignes et Débrief Coach</label>
                <textarea
                  rows={2}
                  placeholder="Notes préalables ou axes d'attention pour les joueurs..."
                  value={newFeedback}
                  onChange={e => setNewFeedback(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateTrainingModalOpen(false);
                    setEditingSession(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
                >
                  {editingSession ? "Enregistrer les modifications" : "Créer et Planifier la Séance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nouvel Exercice */}
      {isCreateExerciseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-base text-slate-900">Ajouter un Exercice à la Bibliothèque</h3>
                <p className="text-xs text-slate-500">Exercice pédagogique réutilisable pour vos séances d'entraînement</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateExerciseModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExercise} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Titre de l'Exercice *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Circuit Agilité & Relance Rapide"
                  value={newExTitle}
                  onChange={e => setNewExTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Catégorie</label>
                  <select
                    value={newExCategory}
                    onChange={e => setNewExCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 outline-hidden"
                  >
                    <option value="Technique">Technique</option>
                    <option value="Tactique">Tactique</option>
                    <option value="Physique / Cardio">Physique / Cardio</option>
                    <option value="Échauffement">Échauffement</option>
                    <option value="Situation de Jeu">Situation de Jeu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Durée (minutes)</label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={newExDuration}
                    onChange={e => setNewExDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Intensité</label>
                  <select
                    value={newExIntensity}
                    onChange={e => setNewExIntensity(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 outline-hidden"
                  >
                    <option value="Faible">Faible</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Élevée">Élevée</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description Synthétique</label>
                <textarea
                  rows={2}
                  placeholder="Objectif de l'exercice et déroulement général..."
                  value={newExDescription}
                  onChange={e => setNewExDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Consigne Pédagogique Principale</label>
                <input
                  type="text"
                  placeholder="Ex: Exiger 3 touches obligatoires avant attaque"
                  value={newExInstruction}
                  onChange={e => setNewExInstruction(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateExerciseModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Enregistrer l'Exercice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
