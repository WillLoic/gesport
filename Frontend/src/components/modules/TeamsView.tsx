import React, { useState } from 'react';
import {
  Shield,
  Users,
  Trophy,
  Calendar,
  Plus,
  User,
  Activity,
  Award,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { Team, Member, SportCategory } from '../../types';
import { SportTacticalPitch } from '../common/SportTacticalPitch';

export const TeamsView: React.FC = () => {
  const { teams, setTeams, members, currentSport, currentSportConfig, showToast } = useClub();
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || 't1');
  const [selectedTab, setSelectedTab] = useState<'roster' | 'lineup' | 'stats'>('roster');
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);

  // New Team Form States
  const [newTeamName, setNewTeamName] = useState('');
  const [newCategory, setNewCategory] = useState<SportCategory>('Senior Régionale');
  const [newDivision, setNewDivision] = useState('Régionale 1');
  const [newCoachName, setNewCoachName] = useState('');
  const [newTrainingDays, setNewTrainingDays] = useState('Mardi & Jeudi 20h-22h');
  const [newHallName, setNewHallName] = useState('Gymnase Municipal');
  const [newColorHex, setNewColorHex] = useState('#2563eb');

  const selectedTeam = teams.find(t => t.id === selectedTeamId) || teams[0];
  const teamMembers = members.filter(m => m.teamId === selectedTeam?.id);

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      showToast('Veuillez renseigner le nom de l\'équipe.');
      return;
    }

    const newTeam: Team = {
      id: `t-${Date.now()}`,
      name: newTeamName.trim(),
      category: newCategory,
      division: newDivision.trim() || 'Championnat Régional',
      coachId: 's1',
      coachName: newCoachName.trim() || 'Staff Technique Club',
      playerIds: [],
      trainingDays: newTrainingDays,
      hallName: newHallName,
      colorHex: newColorHex,
      playedMatches: 0,
      wins: 0,
      losses: 0,
      points: 0,
      ranking: teams.length + 1,
    };

    setTeams(prev => [...prev, newTeam]);
    setSelectedTeamId(newTeam.id);
    setIsCreateTeamModalOpen(false);
    showToast(`Équipe "${newTeam.name}" créée avec succès !`);
    setNewTeamName('');
    setNewCoachName('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Équipes & Compositions Tactiques</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Effectifs officiels, schémas de jeu sur terrain, staff technique et classements
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateTeamModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Ajouter une Équipe
        </button>
      </div>

      {/* Team Selection Cards Horizontal Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {teams.map(team => {
          const isSelected = team.id === selectedTeamId;
          const memberCount = members.filter(m => m.teamId === team.id).length;
          return (
            <button
              key={team.id}
              type="button"
              onClick={() => setSelectedTeamId(team.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`w-3 h-3 rounded-full ${isSelected ? 'bg-white' : ''}`}
                  style={{ backgroundColor: isSelected ? '#ffffff' : team.colorHex }}
                />
                <span className={`text-xs font-bold ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                  #{team.ranking} au classement
                </span>
              </div>
              <h3 className="font-bold text-sm mt-2 truncate">{team.name}</h3>
              <p className={`text-xs mt-0.5 truncate ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                {team.division}
              </p>
              <div className={`mt-3 text-[11px] font-semibold flex items-center justify-between ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                <span>{memberCount} joueurs</span>
                <span>{team.points} pts</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Team Detail View */}
      {selectedTeam && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Team Profile Header Banner */}
          <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-white text-2xl shadow-lg"
                style={{ backgroundColor: selectedTeam.colorHex }}
              >
                {selectedTeam.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold font-display">{selectedTeam.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">
                    {selectedTeam.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Coach Principal : <span className="font-semibold text-white">{selectedTeam.coachName}</span> • Gymnase : {selectedTeam.hallName}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                  <span>Horaires : {selectedTeam.trainingDays}</span>
                </div>
              </div>
            </div>

            {/* Quick Record Score Pill */}
            <div className="flex items-center gap-4 bg-slate-800/80 px-4 py-3 rounded-xl border border-slate-700">
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Matchs Joués</span>
                <p className="text-base font-bold text-white">{selectedTeam.playedMatches}</p>
              </div>
              <div className="h-8 w-px bg-slate-700"></div>
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Victoires</span>
                <p className="text-base font-bold text-emerald-400">{selectedTeam.wins}</p>
              </div>
              <div className="h-8 w-px bg-slate-700"></div>
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-rose-400">Défaites</span>
                <p className="text-base font-bold text-rose-400">{selectedTeam.losses}</p>
              </div>
            </div>
          </div>

          {/* Sub-tabs Navigation */}
          <div className="flex border-b border-slate-200 px-6 bg-slate-50/60">
            <button
              type="button"
              onClick={() => setSelectedTab('roster')}
              className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all ${
                selectedTab === 'roster'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Effectif & Fiches Joueurs ({teamMembers.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab('lineup')}
              className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all ${
                selectedTab === 'lineup'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Dispositif Tactique ({currentSportConfig.systemName})
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab('stats')}
              className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all ${
                selectedTab === 'stats'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Statistiques & Championnat
            </button>
          </div>

          {/* Tab 1: Roster List */}
          {selectedTab === 'roster' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamMembers.map(member => (
                  <div
                    key={member.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all flex items-start gap-3 bg-white"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 font-bold text-base flex items-center justify-center shrink-0">
                      #{member.jerseyNumber}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-slate-900 truncate">
                        {member.firstName} {member.lastName}
                      </h4>
                      <p className="text-xs text-blue-600 font-medium">{member.position}</p>
                      <p className="text-xs text-slate-400 mt-1">{member.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            member.licenseStatus === 'Validée' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {member.licenseStatus}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Certificat : {member.medicalCertValid ? '✓' : '⚠'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Tactical Pitch View */}
          {selectedTab === 'lineup' && (
            <div className="p-6 flex flex-col items-center">
              <div className="w-full max-w-2xl">
                <SportTacticalPitch
                  sport={currentSport}
                  title={`Dispositif Tactique & Alignement — ${selectedTeam.name}`}
                  subtitle={currentSportConfig.systemName}
                  positions={currentSportConfig.tacticalLineup}
                />
              </div>
            </div>
          )}

          {/* Tab 3: Division Standings & League Table */}
          {selectedTab === 'stats' && (
            <div className="p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-800">Classement Provisoire — {selectedTeam.division}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-bold text-[11px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Rang</th>
                      <th className="py-2.5 px-3">Club</th>
                      <th className="py-2.5 px-3 text-center">Joués</th>
                      <th className="py-2.5 px-3 text-center">Gagnés</th>
                      <th className="py-2.5 px-3 text-center">Perdus</th>
                      <th className="py-2.5 px-3 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-400">1</td>
                      <td className="py-2.5 px-3">Grenoble Volley Université</td>
                      <td className="py-2.5 px-3 text-center">14</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600">12</td>
                      <td className="py-2.5 px-3 text-center text-rose-600">2</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">35</td>
                    </tr>
                    <tr className="bg-blue-50/70 text-blue-900 font-bold">
                      <td className="py-2.5 px-3 text-blue-600">2</td>
                      <td className="py-2.5 px-3 flex items-center gap-2">
                        <span>{selectedTeam.name}</span>
                        <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-normal">Notre Club</span>
                      </td>
                      <td className="py-2.5 px-3 text-center">{selectedTeam.playedMatches}</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600">{selectedTeam.wins}</td>
                      <td className="py-2.5 px-3 text-center text-rose-600">{selectedTeam.losses}</td>
                      <td className="py-2.5 px-3 text-right text-blue-700 font-bold">{selectedTeam.points}</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-400">3</td>
                      <td className="py-2.5 px-3">AS Cannes Volley</td>
                      <td className="py-2.5 px-3 text-center">14</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600">10</td>
                      <td className="py-2.5 px-3 text-center text-rose-600">4</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">29</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-400">4</td>
                      <td className="py-2.5 px-3">Nice Volley Ball</td>
                      <td className="py-2.5 px-3 text-center">13</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600">8</td>
                      <td className="py-2.5 px-3 text-center text-rose-600">5</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">24</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Créer une Équipe */}
      {isCreateTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-base text-slate-900">Créer une Nouvelle Équipe</h3>
                <p className="text-xs text-slate-500">Configuration de l'effectif, staff technique et gymnase d'entraînement</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateTeamModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nom de l'Équipe *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Senior Féminine Régionale 1"
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Catégorie d'Âge</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as SportCategory)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 outline-hidden"
                  >
                    <option value="Senior Régionale">Senior Régionale</option>
                    <option value="Senior Nationale">Senior Nationale</option>
                    <option value="Senior Départementale">Senior Départementale</option>
                    <option value="U18 Élite">U18 Élite</option>
                    <option value="U15 Espoir">U15 Espoir</option>
                    <option value="U13 Avenir">U13 Avenir</option>
                    <option value="Loisir & Volley Santé">Loisir / Détente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Division / Championnat</label>
                  <input
                    type="text"
                    placeholder="Ex: Prénationale Poule B"
                    value={newDivision}
                    onChange={e => setNewDivision(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Entraîneur Responsable</label>
                  <input
                    type="text"
                    placeholder="Ex: David Martin"
                    value={newCoachName}
                    onChange={e => setNewCoachName(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Couleur Club / Maillot</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={e => setNewColorHex(e.target.value)}
                      className="w-9 h-9 p-0.5 rounded-lg border border-slate-200 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-600">{newColorHex}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lieu / Gymnase Résident</label>
                  <input
                    type="text"
                    placeholder="Ex: Gymnase Jean Moulin"
                    value={newHallName}
                    onChange={e => setNewHallName(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Créneaux d'Entraînement</label>
                  <input
                    type="text"
                    placeholder="Ex: Lundi & Mercredi 19h-21h"
                    value={newTrainingDays}
                    onChange={e => setNewTrainingDays(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateTeamModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Créer l'Équipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
