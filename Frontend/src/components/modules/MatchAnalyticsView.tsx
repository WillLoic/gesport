import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Plus,
  Star,
  X,
  Trash2,
  FileText,
  Pencil,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { MatchStats } from '../../types';
import { competitionService } from '../../services/competitionService';

export const MatchAnalyticsView: React.FC = () => {
  const { matchStats, setMatchStats, teams, showToast } = useClub();
  const [selectedMatch, setSelectedMatch] = useState<MatchStats | null>(matchStats[0] || null);
  const [isNewMatchModalOpen, setIsNewMatchModalOpen] = useState(false);
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedMatch && matchStats.length > 0) {
      setSelectedMatch(matchStats[0]);
    }
  }, [matchStats, selectedMatch]);

  // Form State for Create / Edit
  const [newTeamId, setNewTeamId] = useState(teams[0]?.id || '1');
  const [newMatchTitle, setNewMatchTitle] = useState('');
  const [newOpponent, setNewOpponent] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newResult, setNewResult] = useState<'Victoire' | 'Défaite' | 'Nul'>('Victoire');
  const [newFinalScore, setNewFinalScore] = useState('3 - 1');
  const [newMvpName, setNewMvpName] = useState('');
  const [newCoachDebrief, setNewCoachDebrief] = useState('');

  const handleOpenCreateModal = () => {
    setEditingMatchId(null);
    setNewTeamId(teams[0]?.id || '1');
    setNewMatchTitle('');
    setNewOpponent('');
    setNewDate(new Date().toISOString().split('T')[0]);
    setNewResult('Victoire');
    setNewFinalScore('3 - 1');
    setNewMvpName('');
    setNewCoachDebrief('');
    setIsNewMatchModalOpen(true);
  };

  const handleOpenEditModal = (matchToEdit: MatchStats) => {
    setEditingMatchId(matchToEdit.id);
    const matchedTeam = teams.find(t => t.name === matchToEdit.teamName);
    setNewTeamId(matchedTeam?.id || teams[0]?.id || '1');
    setNewMatchTitle(matchToEdit.matchTitle || '');
    setNewOpponent(matchToEdit.opponent || '');
    setNewDate(matchToEdit.date || new Date().toISOString().split('T')[0]);
    setNewResult(matchToEdit.result || 'Victoire');
    setNewFinalScore(matchToEdit.finalScore || '3 - 1');
    setNewMvpName(matchToEdit.mvpPlayerName || '');
    setNewCoachDebrief(matchToEdit.coachDebrief || '');
    setIsNewMatchModalOpen(true);
  };

  const handleSaveMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOpponent.trim()) {
      showToast('Veuillez renseigner le nom de l\'équipe adverse.');
      return;
    }

    const assignedTeam = teams.find(t => String(t.id) === String(newTeamId)) || teams[0];

    const draftMatch: MatchStats = {
      id: editingMatchId || `match-${Date.now()}`,
      eventId: `ev-${Date.now()}`,
      teamName: assignedTeam ? assignedTeam.name : 'Gesport',
      opponent: newOpponent.trim(),
      date: newDate,
      matchTitle: newMatchTitle.trim() || `Journée de Championnat vs ${newOpponent.trim()}`,
      result: newResult,
      finalScore: newFinalScore.trim(),
      mvpPlayerName: newMvpName.trim() || 'Non désigné',
      setsDetail: [],
      playerStats: [],
      coachDebrief: newCoachDebrief.trim() || 'Aucun débriefing renseigné.',
    };

    if (editingMatchId) {
      try {
        const updatedMatch = await competitionService.updateMatchStatsSheet(editingMatchId, draftMatch, Number(newTeamId) || 1);
        setMatchStats(prev => prev.map(m => m.id === editingMatchId ? updatedMatch : m));
        setSelectedMatch(updatedMatch);
        showToast(`Feuille de match vs ${updatedMatch.opponent} modifiée avec succès !`);
      } catch (err) {
        console.warn('Modification match backend locale fallback:', err);
        setMatchStats(prev => prev.map(m => m.id === editingMatchId ? draftMatch : m));
        setSelectedMatch(draftMatch);
        showToast(`Feuille de match vs ${draftMatch.opponent} modifiée en local !`);
      }
    } else {
      try {
        const createdMatch = await competitionService.createMatchStats(draftMatch, Number(newTeamId) || 1);
        setMatchStats(prev => [createdMatch, ...prev]);
        setSelectedMatch(createdMatch);
        showToast(`Feuille de match vs ${createdMatch.opponent} enregistrée avec succès !`);
      } catch (err) {
        console.warn('Sauvegarde match backend fallback:', err);
        setMatchStats(prev => [draftMatch, ...prev]);
        setSelectedMatch(draftMatch);
        showToast(`Feuille de match vs ${draftMatch.opponent} enregistrée en local !`);
      }
    }

    setIsNewMatchModalOpen(false);
  };

  const handleDeleteMatch = async (matchToDelete: MatchStats) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la feuille de match vs ${matchToDelete.opponent} ?`)) {
      return;
    }

    try {
      if (matchToDelete.id && !matchToDelete.id.startsWith('match-')) {
        await competitionService.deleteMatch(matchToDelete.id);
      }
    } catch (err) {
      console.warn('Erreur suppression match backend:', err);
    }

    const updated = matchStats.filter(m => m.id !== matchToDelete.id);
    setMatchStats(updated);
    if (selectedMatch?.id === matchToDelete.id) {
      setSelectedMatch(updated[0] || null);
    }
    showToast(`Feuille de match vs ${matchToDelete.opponent} supprimée avec succès.`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Statistiques Sportives & Matchs</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Feuilles de match digitales, bilans des rencontres et comptes-rendus tactiques des coachs
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          Saisir un Nouveau Match
        </button>
      </div>

      {/* Match Selector Tabs */}
      <div className="flex flex-wrap gap-2.5">
        {matchStats.map(m => {
          const isSelected = selectedMatch?.id === m.id;
          return (
            <div
              key={m.id}
              className={`flex items-center rounded-xl border transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedMatch(m)}
                className="p-3.5 text-left cursor-pointer flex-1"
              >
                <div className="flex items-center justify-between gap-3 text-xs mb-1">
                  <span className="font-bold">{m.teamName}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.result === 'Victoire'
                        ? 'bg-emerald-500 text-white'
                        : m.result === 'Défaite'
                        ? 'bg-rose-500 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {m.result} ({m.finalScore})
                  </span>
                </div>
                <p className={`text-xs ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  vs {m.opponent} • {m.date}
                </p>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEditModal(m);
                }}
                className={`p-2 rounded-lg hover:bg-blue-500 hover:text-white transition-colors cursor-pointer ${
                  isSelected ? 'text-slate-400 hover:text-white' : 'text-slate-400'
                }`}
                title="Modifier la feuille de match"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteMatch(m);
                }}
                className={`p-2 mr-1 rounded-lg hover:bg-rose-500 hover:text-white transition-colors cursor-pointer ${
                  isSelected ? 'text-slate-400 hover:text-white' : 'text-slate-400'
                }`}
                title="Supprimer la feuille de match"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Detailed Match Sheet */}
      {selectedMatch && (
        <div className="space-y-6">
          {/* Top Match Result Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-xl border border-white/20">
                <Trophy className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-display">{selectedMatch.matchTitle}</h2>
                <p className="text-xs text-blue-200 mt-0.5">
                  Date : {selectedMatch.date} • Équipe : {selectedMatch.teamName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Score & Result Chip */}
              <div className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-center">
                <span className="text-[10px] uppercase font-bold text-blue-300 block mb-0.5">Score Final ({selectedMatch.result})</span>
                <span className="text-lg font-black text-white">{selectedMatch.finalScore}</span>
              </div>

              {/* MVP Badge */}
              <div className="p-3 rounded-xl bg-amber-400 text-slate-950 flex items-center gap-3 shadow-lg">
                <Star className="w-6 h-6 fill-slate-950 text-slate-950" />
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider">MVP de la Rencontre</span>
                  <p className="text-sm font-bold leading-tight">{selectedMatch.mvpPlayerName || 'Non désigné'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Match Info Details Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Informations Enregistrées de la Feuille de Match
              </h3>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(selectedMatch)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors cursor-pointer border border-amber-200"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteMatch(selectedMatch)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer border border-rose-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Supprimer
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-medium text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Équipe du Club</span>
                <p className="font-bold text-slate-900">{selectedMatch.teamName}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Adversaire</span>
                <p className="font-bold text-slate-900">{selectedMatch.opponent}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Date de la Rencontre</span>
                <p className="font-bold text-slate-900">{selectedMatch.date}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Issue du Match</span>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-md font-bold text-xs ${
                    selectedMatch.result === 'Victoire'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedMatch.result === 'Défaite'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {selectedMatch.result}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Score Final</span>
                <p className="font-bold text-blue-600">{selectedMatch.finalScore}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100">
                <span className="text-[10px] uppercase font-bold text-amber-700 block mb-0.5">MVP Désigné</span>
                <p className="font-bold text-amber-900">{selectedMatch.mvpPlayerName || 'Non désigné'}</p>
              </div>
            </div>
          </div>

          {/* Coach Debrief & Tactical Notes */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase text-slate-400 tracking-wider">
              Analyse & Débriefing du Staff Technique
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium whitespace-pre-wrap">
              "{selectedMatch.coachDebrief || 'Aucun débriefing renseigné pour cette rencontre.'}"
            </p>
          </div>
        </div>
      )}

      {/* New / Edit Match Modal */}
      {isNewMatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 font-display">
                    {editingMatchId ? 'Modifier la Feuille de Match' : 'Nouvelle Feuille de Match'}
                  </h3>
                  <p className="text-xs text-slate-500">Saisissez les résultats officiels de la rencontre</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewMatchModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMatch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Équipe du Club
                  </label>
                  <select
                    value={newTeamId}
                    onChange={e => setNewTeamId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Équipe Adverse / Adversaire *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Paris Volley, Stade Toulousain..."
                    value={newOpponent}
                    onChange={e => setNewOpponent(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Intitulé / Compétition
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: J12 Nationale 1, Coupe..."
                    value={newMatchTitle}
                    onChange={e => setNewMatchTitle(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date de la Rencontre
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Issue du Match
                  </label>
                  <select
                    value={newResult}
                    onChange={e => setNewResult(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    <option value="Victoire">Victoire</option>
                    <option value="Défaite">Défaite</option>
                    <option value="Nul">Nul</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Score Final (ex: 3 - 1 ou 85 - 78)
                  </label>
                  <input
                    type="text"
                    value={newFinalScore}
                    onChange={e => setNewFinalScore(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    MVP Désigné
                  </label>
                  <input
                    type="text"
                    placeholder="Nom du meilleur joueur"
                    value={newMvpName}
                    onChange={e => setNewMvpName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Débriefing & Bilan du Coach
                </label>
                <textarea
                  rows={3}
                  placeholder="Points forts tactiques, secteurs à travailler..."
                  value={newCoachDebrief}
                  onChange={e => setNewCoachDebrief(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewMatchModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  {editingMatchId ? 'Enregistrer les Modifications' : 'Enregistrer la Feuille de Match'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


