import React, { useState } from 'react';
import {
  BarChart3,
  Trophy,
  Award,
  Plus,
  Flame,
  Star,
  CheckCircle,
  TrendingUp,
  X,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { MatchStats } from '../../types';

export const MatchAnalyticsView: React.FC = () => {
  const { matchStats, setMatchStats, teams, members, currentSportConfig, showToast } = useClub();
  const [selectedMatch, setSelectedMatch] = useState<MatchStats>(matchStats[0] || null);
  const [isNewMatchModalOpen, setIsNewMatchModalOpen] = useState(false);

  // New Match Form State
  const [newTeamId, setNewTeamId] = useState(teams[0]?.id || 't1');
  const [newMatchTitle, setNewMatchTitle] = useState('');
  const [newOpponent, setNewOpponent] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newResult, setNewResult] = useState<'Victoire' | 'Défaite'>('Victoire');
  const [newFinalScore, setNewFinalScore] = useState('3 - 1');
  const [newMvpName, setNewMvpName] = useState('');
  const [newSet1, setNewSet1] = useState('25-21');
  const [newSet2, setNewSet2] = useState('23-25');
  const [newSet3, setNewSet3] = useState('25-18');
  const [newSet4, setNewSet4] = useState('25-20');
  const [newCoachDebrief, setNewCoachDebrief] = useState('');

  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOpponent.trim()) {
      showToast('Veuillez renseigner le nom de l\'équipe adverse.');
      return;
    }

    const assignedTeam = teams.find(t => t.id === newTeamId) || teams[0];
    const teamMembers = members.filter(m => m.teamId === newTeamId);

    // Build sets breakdown
    const rawSets = [newSet1, newSet2, newSet3, newSet4].filter(s => s && s.includes('-'));
    const setsDetail = rawSets.map((s, idx) => {
      const parts = s.split('-').map(p => Number(p.trim()) || 0);
      return {
        setNumber: idx + 1,
        scoreHome: parts[0] || 0,
        scoreAway: parts[1] || 0,
      };
    });

    const playerStats = (teamMembers.length > 0 ? teamMembers : members.slice(0, 5)).map((m, idx) => ({
      playerId: m.id,
      playerName: `${m.firstName} ${m.lastName}`,
      pointsScored: 8 + Math.floor(Math.random() * 14),
      aces: Math.floor(Math.random() * 4),
      blocks: Math.floor(Math.random() * 5),
      attackSuccessPct: 45 + Math.floor(Math.random() * 30),
      serveFaults: Math.floor(Math.random() * 3),
      rating: Number((7.0 + Math.random() * 2.5).toFixed(1)),
    }));

    const newMatch: MatchStats = {
      id: `match-${Date.now()}`,
      eventId: `ev-${Date.now()}`,
      teamName: assignedTeam ? assignedTeam.name : 'Équipe 1',
      opponent: newOpponent.trim(),
      date: newDate,
      matchTitle: newMatchTitle.trim() || `Journée de Championnat vs ${newOpponent.trim()}`,
      result: newResult,
      finalScore: newFinalScore.trim(),
      mvpPlayerName: newMvpName.trim() || (playerStats[0] ? playerStats[0].playerName : 'Joueur du Match'),
      setsDetail: setsDetail.length > 0 ? setsDetail : [
        { setNumber: 1, scoreHome: 25, scoreAway: 21 },
        { setNumber: 2, scoreHome: 25, scoreAway: 19 },
        { setNumber: 3, scoreHome: 25, scoreAway: 17 },
      ],
      playerStats: playerStats,
      coachDebrief: newCoachDebrief.trim() || 'Excellente combativité collective, rigueur tactique respectée et belle solidité sur les points cruciaux.',
    };

    setMatchStats(prev => [newMatch, ...prev]);
    setSelectedMatch(newMatch);
    setIsNewMatchModalOpen(false);
    showToast(`Feuille de match vs ${newMatch.opponent} enregistrée avec succès !`);

    // Reset Form
    setNewOpponent('');
    setNewMatchTitle('');
    setNewCoachDebrief('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Statistiques Sportives & Matchs</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Feuilles de match digitales, notes individuelles des joueurs, sets détaillés et bilans des coachs
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewMatchModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer transition-all"
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
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedMatch(m)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-3 text-xs mb-1">
                <span className="font-bold">{m.teamName}</span>
                <span
                  className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                    m.result === 'Victoire' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                  }`}
                >
                  {m.result} ({m.finalScore})
                </span>
              </div>
              <p className={`text-xs ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                vs {m.opponent} • {m.date}
              </p>
            </button>
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

            {/* Set by set score chips */}
            <div className="flex flex-wrap items-center gap-2">
              {selectedMatch.setsDetail.map(set => (
                <div
                  key={set.setNumber}
                  className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-center"
                >
                  <span className="text-[10px] uppercase font-bold text-blue-300 block">Set {set.setNumber}</span>
                  <span className="text-sm font-bold text-white">
                    {set.scoreHome} - {set.scoreAway}
                  </span>
                </div>
              ))}
            </div>

            {/* MVP Badge */}
            <div className="p-3 rounded-xl bg-amber-400 text-slate-950 flex items-center gap-3 shadow-lg">
              <Star className="w-6 h-6 fill-slate-950 text-slate-950" />
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider">MVP de la Rencontre</span>
                <p className="text-sm font-bold leading-tight">{selectedMatch.mvpPlayerName}</p>
              </div>
            </div>
          </div>

          {/* Individual Players Performance Table */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Statistiques Individuelles des Joueurs
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Joueur</th>
                    <th className="py-3 px-3 text-center">Points Marqués</th>
                    <th className="py-3 px-3 text-center">Aces (Services)</th>
                    <th className="py-3 px-3 text-center">Contres / Blocs</th>
                    <th className="py-3 px-3 text-center">% Réussite Attaque</th>
                    <th className="py-3 px-3 text-center">Fautes Service</th>
                    <th className="py-3 px-3 text-right">Note Globale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {selectedMatch.playerStats.map(ps => (
                    <tr key={ps.playerId} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-semibold text-slate-900">{ps.playerName}</td>
                      <td className="py-3 px-3 text-center font-bold text-blue-600">{ps.pointsScored}</td>
                      <td className="py-3 px-3 text-center text-emerald-600 font-semibold">{ps.aces}</td>
                      <td className="py-3 px-3 text-center text-indigo-600 font-semibold">{ps.blocks}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-semibold text-slate-800">{ps.attackSuccessPct}%</span>
                      </td>
                      <td className="py-3 px-3 text-center text-rose-500 font-semibold">{ps.serveFaults}</td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg font-bold text-xs ${
                            ps.rating >= 8.5
                              ? 'bg-emerald-100 text-emerald-800'
                              : ps.rating >= 7
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ps.rating} / 10
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Coach Debrief & Tactical Notes */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase text-slate-400 tracking-wider">
              Analyse & Débriefing du Staff Technique
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              "{selectedMatch.coachDebrief}"
            </p>
          </div>
        </div>
      )}

      {/* New Match Modal */}
      {isNewMatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 font-display">Nouvelle Feuille de Match</h3>
                  <p className="text-xs text-slate-500">Saisissez les résultats officiels et statistiques de la rencontre</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewMatchModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMatch} className="space-y-4">
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

              {/* Set / Period breakdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Détail par Set / Mi-temps / Période (Scores)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Set 1 (25-21)"
                    value={newSet1}
                    onChange={e => setNewSet1(e.target.value)}
                    className="px-2.5 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-center font-mono font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Set 2 (23-25)"
                    value={newSet2}
                    onChange={e => setNewSet2(e.target.value)}
                    className="px-2.5 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-center font-mono font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Set 3 (25-18)"
                    value={newSet3}
                    onChange={e => setNewSet3(e.target.value)}
                    className="px-2.5 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-center font-mono font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Set 4 (25-20)"
                    value={newSet4}
                    onChange={e => setNewSet4(e.target.value)}
                    className="px-2.5 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-center font-mono font-bold"
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
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors"
                >
                  Enregistrer la Feuille de Match
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
