import React, { useState } from 'react';
import {
  Users,
  CheckCircle,
  Vote,
  FileText,
  Plus,
  Clock,
  Download,
  CheckSquare,
  BarChart,
  X,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { ClubMeeting } from '../../types';

export const ClubMeetingsView: React.FC = () => {
  const { meetings, setMeetings, showToast } = useClub();
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(meetings[0]?.id || '');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Meeting Form State
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ClubMeeting['type']>('Bureau Directeur');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('19:00');
  const [newLocation, setNewLocation] = useState('Siège du Club (Salle Réunions) & Visio');
  const [newQuorumNeeded, setNewQuorumNeeded] = useState(5);
  const [newAgenda, setNewAgenda] = useState('1. Approbation du PV précédent\n2. Bilan sportif et organisationnel\n3. Trésorerie et budgets\n4. Questions diverses');
  const [newResolution, setNewResolution] = useState('Validation du budget prévisionnel des prochaines compétitions');

  const selectedMeeting = meetings.find(m => m.id === selectedMeetingId) || meetings[0] || null;

  const handleCastVote = (meetingId: string, voteIndex: number, type: 'pour' | 'contre' | 'abstention') => {
    setMeetings(prev =>
      prev.map(m => {
        if (m.id === meetingId) {
          const updatedVotes = [...m.votes];
          const target = { ...updatedVotes[voteIndex] };
          if (type === 'pour') target.votesFor += 1;
          if (type === 'contre') target.votesAgainst += 1;
          if (type === 'abstention') target.abstentions += 1;

          target.result = target.votesFor >= target.votesAgainst ? 'Adopté' : 'Rejeté';
          updatedVotes[voteIndex] = target;
          return { ...m, votes: updatedVotes };
        }
        return m;
      })
    );
    showToast(`Votre vote "${type}" a été comptabilisé sur la résolution !`);
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Veuillez indiquer un titre pour la réunion.');
      return;
    }

    const agendaItems = newAgenda
      .split('\n')
      .map(item => item.trim())
      .filter(Boolean);

    const newMeeting: ClubMeeting = {
      id: `meet-${Date.now()}`,
      title: newTitle,
      type: newType,
      date: newDate,
      time: newTime,
      location: newLocation,
      quorumNeeded: Number(newQuorumNeeded) || 5,
      attendeesCount: Number(newQuorumNeeded) || 5,
      status: 'Planifiée',
      agendaItems: agendaItems.length > 0 ? agendaItems : ['Ordre du jour à définir'],
      votes: newResolution.trim()
        ? [
            {
              resolution: newResolution,
              votesFor: 0,
              votesAgainst: 0,
              abstentions: 0,
              result: 'Adopté',
            },
          ]
        : [],
      minutesGenerated: false,
    };

    setMeetings(prev => [newMeeting, ...prev]);
    setSelectedMeetingId(newMeeting.id);
    setShowCreateModal(false);
    showToast(`La réunion "${newTitle}" a été convoquée avec succès ! Convocations envoyées.`);

    // Reset Form
    setNewTitle('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Gouvernance, AG & Réunions de Bureau</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Organisation des Assemblées Générales, votes électroniques des résolutions, calcul de quorum et PV officiels
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Convoquer une Réunion / AG
        </button>
      </div>

      {/* Grid: Meetings list + Selected Meeting detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: List of meetings */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
            Séances Programmées ({meetings.length})
          </h3>
          <div className="space-y-2">
            {meetings.map(m => {
              const isSelected = selectedMeeting?.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMeetingId(m.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected ? 'bg-blue-50/80 border-blue-500 shadow-xs' : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-blue-700">{m.type}</span>
                    <span className="text-slate-400 font-semibold">{m.date}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{m.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{m.location} • {m.time}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Selected Meeting details & interactive vote */}
        <div className="lg:col-span-2">
          {selectedMeeting ? (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {selectedMeeting.type} • Statut : {selectedMeeting.status}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-2">{selectedMeeting.title}</h2>
                  <p className="text-xs text-slate-500">
                    Lieu : {selectedMeeting.location} | Date : {selectedMeeting.date} à {selectedMeeting.time}
                  </p>
                </div>

                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-center">
                  <span className="text-[10px] uppercase font-bold text-blue-600">Quorum Atteint</span>
                  <p className="text-sm font-bold text-slate-900">
                    {selectedMeeting.attendeesCount} / {selectedMeeting.quorumNeeded} présents
                  </p>
                </div>
              </div>

              {/* Agenda / Ordre du jour */}
              <div>
                <h3 className="font-bold text-sm text-slate-900 mb-2">Ordre du Jour</h3>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {selectedMeeting.agendaItems?.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resolutions & Interactive Voting */}
              <div>
                <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
                  <Vote className="w-4 h-4 text-blue-600" />
                  Résolutions Soumises au Vote ({selectedMeeting.votes?.length || 0})
                </h3>

                {selectedMeeting.votes && selectedMeeting.votes.length > 0 ? (
                  <div className="space-y-4">
                    {selectedMeeting.votes.map((res, idx) => {
                      const totalVotes = res.votesFor + res.votesAgainst + res.abstentions;
                      const forPct = totalVotes > 0 ? Math.round((res.votesFor / totalVotes) * 100) : 0;
                      return (
                        <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                          <div className="flex items-start justify-between">
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900">{res.resolution}</h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                res.result === 'Adopté' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {res.result}
                            </span>
                          </div>

                          {/* Vote Results Bar */}
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between text-slate-600">
                              <span>Pour : {res.votesFor} ({forPct}%)</span>
                              <span>Contre : {res.votesAgainst}</span>
                              <span>Abstentions : {res.abstentions}</span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                              <div className="bg-emerald-500 h-full" style={{ width: `${forPct}%` }}></div>
                              <div className="bg-rose-500 h-full" style={{ width: `${totalVotes > 0 ? (res.votesAgainst / totalVotes) * 100 : 0}%` }}></div>
                            </div>
                          </div>

                          {/* Interactive Voting Actions */}
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                            <span className="text-[11px] text-slate-500 font-semibold mr-2">Voter :</span>
                            <button
                              type="button"
                              onClick={() => handleCastVote(selectedMeeting.id, idx, 'pour')}
                              className="px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-lg cursor-pointer"
                            >
                              ✓ Pour
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCastVote(selectedMeeting.id, idx, 'contre')}
                              className="px-3 py-1 text-xs font-bold bg-rose-100 text-rose-800 hover:bg-rose-200 rounded-lg cursor-pointer"
                            >
                              ✗ Contre
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCastVote(selectedMeeting.id, idx, 'abstention')}
                              className="px-3 py-1 text-xs font-bold bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg cursor-pointer"
                            >
                              Abstention
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Aucune résolution soumise au vote pour le moment.</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => showToast('Procès-Verbal officiel généré et téléchargé en PDF !')}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl cursor-pointer"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  Exporter PV Signé (.PDF)
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-400">
              Sélectionnez une réunion pour consulter l'ordre du jour et les votes.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Convoquer une Réunion / AG */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-base text-slate-900">Convoquer une Réunion / Assemblée Générale</h3>
                <p className="text-xs text-slate-500">Création de séance, quorum légal et ordre du jour</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Titre de la Séance *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Assemblée Générale Ordinaire 2025"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type d'Instance *</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 outline-hidden"
                  >
                    <option value="Bureau Directeur">Bureau Directeur</option>
                    <option value="Assemblée Générale Ordinaire">Assemblée Générale Ordinaire</option>
                    <option value="AG Extraordinaire">AG Extraordinaire</option>
                    <option value="Comité Technique">Comité Technique</option>
                    <option value="Commission Discipline">Commission Discipline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quorum Minimum Requis</label>
                  <input
                    type="number"
                    min="1"
                    value={newQuorumNeeded}
                    onChange={e => setNewQuorumNeeded(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date de la Séance</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Horaire Début</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lieu ou Lien Visioconférence</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Points à l'Ordre du Jour (un par ligne)</label>
                <textarea
                  rows={3}
                  value={newAgenda}
                  onChange={e => setNewAgenda(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Résolution Principale Soumise au Vote</label>
                <input
                  type="text"
                  value={newResolution}
                  onChange={e => setNewResolution(e.target.value)}
                  placeholder="Ex: Approbation du compte de résultat 2024"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Envoyer Convocations & Créer Séance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
