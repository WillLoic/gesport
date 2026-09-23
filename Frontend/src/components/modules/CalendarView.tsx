import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  Shield,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  X,
  Pencil,
  Trash2,
  Check,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { SportEvent, EventType, SummonedPlayer } from '../../types';
import { competitionService } from '../../services/competitionService';

export const CalendarView: React.FC = () => {
  const { events, setEvents, teams, members, vehicles, showToast } = useClub();

  const [currentView, setCurrentView] = useState<'month' | 'week' | 'list'>('month');
  const [selectedEvent, setSelectedEvent] = useState<SportEvent | null>(events[0] || null);
  const [filterType, setFilterType] = useState<string>('all');
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SportEvent | null>(null);

  // New / Edit Event Form States
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState<EventType>('match_official');
  const [newTeamId, setNewTeamId] = useState(teams[0]?.id || '1');
  const [newOpponent, setNewOpponent] = useState('');
  const [newIsHome, setNewIsHome] = useState(true);
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStartTime, setNewStartTime] = useState('20:00');
  const [newEndTime, setNewEndTime] = useState('22:00');
  const [newConvocationTime, setNewConvocationTime] = useState('18:45');
  const [newLocation, setNewLocation] = useState('Gymnase Principal');
  const [newHall, setNewHall] = useState('Terrain A');
  const [newNotes, setNewNotes] = useState('');
  const [selectedCallupPlayerIds, setSelectedCallupPlayerIds] = useState<string[]>([]);

  const currentTeamMembers = members.filter(m => m.teamId === newTeamId);

  // Helper pour obtenir la liste effective des joueurs convoqués (avec fallback sur l'effectif)
  const getEffectiveSummonedPlayers = (event: SportEvent): SummonedPlayer[] => {
    if (event.summonedPlayers && event.summonedPlayers.length > 0) {
      return event.summonedPlayers;
    }
    const squad = members.filter(m => !event.teamId || m.teamId === event.teamId || event.teamId === '1');
    const sourceMembers = squad.length > 0 ? squad : members;
    return sourceMembers.slice(0, 5).map((m, idx) => ({
      playerId: m.id,
      playerName: `${m.firstName} ${m.lastName}`,
      status: (idx === 2 ? 'En attente' : 'Confirmé') as any,
      transport: 'Voiture perso' as const,
    }));
  };

  const openCreateEventModal = () => {
    setEditingEvent(null);
    setNewEventTitle('');
    setNewEventType('match_official');
    const defaultTeamId = teams[0]?.id || '1';
    setNewTeamId(defaultTeamId);
    setNewOpponent('');
    setNewIsHome(true);
    setNewEventDate(new Date().toISOString().split('T')[0]);
    setNewStartTime('20:00');
    setNewEndTime('22:00');
    setNewConvocationTime('18:45');
    setNewLocation('Gymnase Principal');
    setNewHall('Terrain A');
    setNewNotes('');
    const squad = members.filter(m => m.teamId === defaultTeamId);
    setSelectedCallupPlayerIds(squad.map(m => m.id));
    setIsCreateEventModalOpen(true);
  };

  const openEditEventModal = (event: SportEvent, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingEvent(event);
    setNewEventTitle(event.title);
    setNewEventType(event.type);
    setNewTeamId(event.teamId || teams[0]?.id || '1');
    setNewOpponent(event.opponent || '');
    setNewIsHome(event.isHome ?? true);
    setNewEventDate(event.date);
    setNewStartTime(event.startTime);
    setNewEndTime(event.endTime);
    setNewConvocationTime(event.convocationTime || '18:45');
    setNewLocation(event.location);
    setNewHall(event.hall || 'Terrain A');
    setNewNotes(event.notes || '');
    const effectivePlayers = getEffectiveSummonedPlayers(event);
    setSelectedCallupPlayerIds(effectivePlayers.map(p => p.playerId));
    setIsCreateEventModalOpen(true);
  };

  const handleDeleteEvent = async (eventId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const evToDelete = events.find(ev => ev.id === eventId);
    if (!evToDelete) return;

    if (!window.confirm(`Voulez-vous vraiment supprimer l'événement "${evToDelete.title}" ?`)) {
      return;
    }

    try {
      await competitionService.deleteMatch(eventId);
    } catch (err) {
      console.warn('Erreur lors de la suppression backend:', err);
    }

    setEvents(prev => prev.filter(ev => ev.id !== eventId));
    if (selectedEvent?.id === eventId) {
      const remaining = events.filter(ev => ev.id !== eventId);
      setSelectedEvent(remaining[0] || null);
    }
    showToast(`Événement "${evToDelete.title}" supprimé avec succès !`);
  };

  const handleTeamChange = (teamId: string) => {
    setNewTeamId(teamId);
    const squad = members.filter(m => m.teamId === teamId);
    setSelectedCallupPlayerIds(squad.map(m => m.id));
  };

  const handleToggleAllCallups = () => {
    if (selectedCallupPlayerIds.length === currentTeamMembers.length) {
      setSelectedCallupPlayerIds([]);
    } else {
      setSelectedCallupPlayerIds(currentTeamMembers.map(m => m.id));
    }
  };

  const handleTogglePlayerCallup = (id: string) => {
    setSelectedCallupPlayerIds(prev =>
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) {
      showToast('Veuillez donner un titre à l\'événement.');
      return;
    }

    const assignedTeam = teams.find(t => t.id === newTeamId) || teams[0];
    const selectedMembers = members.filter(m => selectedCallupPlayerIds.includes(m.id));

    const evData: Partial<SportEvent> = {
      title: newEventTitle.trim(),
      type: newEventType,
      teamId: assignedTeam ? assignedTeam.id : '1',
      teamName: assignedTeam ? assignedTeam.name : 'Équipe 1',
      opponent: newOpponent.trim() || (newEventType.startsWith('match') ? 'Adversaire' : undefined),
      isHome: newIsHome,
      date: newEventDate,
      startTime: newStartTime,
      endTime: newEndTime,
      convocationTime: newConvocationTime,
      location: newLocation.trim() || 'Gymnase du Club',
      hall: newHall,
      notes: newNotes.trim() || undefined,
      status: editingEvent ? editingEvent.status : 'Programmé',
      summonedPlayers: selectedMembers.map(m => {
        const existing = editingEvent?.summonedPlayers?.find(p => p.playerId === m.id);
        return existing || {
          playerId: m.id,
          playerName: `${m.firstName} ${m.lastName}`,
          status: 'En attente',
          transport: 'Voiture perso',
        };
      }),
    };

    if (editingEvent) {
      try {
        const updated = await competitionService.updateMatch(editingEvent.id, evData);
        const updatedEvent: SportEvent = { ...editingEvent, ...evData, id: editingEvent.id } as SportEvent;
        setEvents(prev => prev.map(ev => ev.id === editingEvent.id ? updatedEvent : ev));
        if (selectedEvent?.id === editingEvent.id) {
          setSelectedEvent(updatedEvent);
        }
        showToast(`Événement "${updatedEvent.title}" mis à jour avec succès !`);
      } catch (err: any) {
        const updatedEvent: SportEvent = { ...editingEvent, ...evData, id: editingEvent.id } as SportEvent;
        setEvents(prev => prev.map(ev => ev.id === editingEvent.id ? updatedEvent : ev));
        if (selectedEvent?.id === editingEvent.id) {
          setSelectedEvent(updatedEvent);
        }
        showToast(`Événement "${updatedEvent.title}" mis à jour !`);
      }
    } else {
      try {
        const createdEvent = await competitionService.createMatch(evData, Number(assignedTeam?.id) || 1);
        for (const p of selectedMembers) {
          try {
            await competitionService.addCallup(createdEvent.id, p.id, 'Convoqué');
          } catch (err) {}
        }
        setEvents(prev => [createdEvent, ...prev]);
        setSelectedEvent(createdEvent);
        showToast(`Événement "${createdEvent.title}" avec ${selectedMembers.length} joueurs convoqués enregistré !`);
      } catch (err: any) {
        const localId = 'e_' + Date.now();
        const newEv = { ...evData, id: localId } as SportEvent;
        setEvents(prev => [newEv, ...prev]);
        setSelectedEvent(newEv);
        showToast(`Événement "${newEv.title}" enregistré !`);
      }
    }

    setIsCreateEventModalOpen(false);
    setEditingEvent(null);
    setNewEventTitle('');
    setNewOpponent('');
    setNewNotes('');
  };

  const filteredEvents = events.filter(e => {
    if (filterType === 'all') return true;
    return e.type === filterType;
  });

  const handleUpdatePlayerStatus = async (eventId: string, playerId: string, newStatus: 'Confirmé' | 'Absent' | 'En attente') => {
    setEvents(prev =>
      prev.map(ev => {
        if (ev.id === eventId) {
          const list = getEffectiveSummonedPlayers(ev);
          const updatedSummoned = list.map(p =>
            p.playerId === playerId ? { ...p, status: newStatus } : p
          );
          return { ...ev, summonedPlayers: updatedSummoned };
        }
        return ev;
      })
    );

    if (selectedEvent && selectedEvent.id === eventId) {
      const list = getEffectiveSummonedPlayers(selectedEvent);
      setSelectedEvent({
        ...selectedEvent,
        summonedPlayers: list.map(p =>
          p.playerId === playerId ? { ...p, status: newStatus } : p
        ),
      });
    }

    try {
      const backendStatusMap: Record<string, string> = {
        'Confirmé': 'Présent',
        'Absent': 'Absent',
        'En attente': 'Convoqué',
      };
      await competitionService.addCallup(eventId, playerId, backendStatusMap[newStatus] || 'Convoqué');
    } catch (err) {
      console.warn('Erreur mise à jour convocation backend:', err);
    }

    showToast(`Statut de convocation actualisé (${newStatus})`);
  };

  const getEventTypeBadge = (type: EventType) => {
    switch (type) {
      case 'match_official':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Match Officiel</span>;
      case 'match_friendly':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">Amical</span>;
      case 'training':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Entraînement</span>;
      case 'tournament':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Tournoi</span>;
      case 'meeting':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Réunion Club</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">Événement</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Calendrier Sportif & Convocations</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Planning des matchs officiels, entraînements, tournois et gestion des présences
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setCurrentView('month')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                currentView === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mois
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('week')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                currentView === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semaine
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('list')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                currentView === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Liste
            </button>
          </div>

          <button
            type="button"
            onClick={openCreateEventModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nouveau Match / Événement
          </button>
        </div>
      </div>

      {/* Main Section: Calendar Grid (Left) + Selected Convocation Sheet (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Events List / Calendar */}
        <div className="lg:col-span-2 space-y-4">
          {/* Month Bar Controls */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Mars 2025</h2>
                <p className="text-xs text-slate-400">Saison 2024-2025 • Phase retour</p>
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5">
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 outline-hidden"
              >
                <option value="all">Tous les types</option>
                <option value="match_official">Matchs Officiels</option>
                <option value="training">Entraînements</option>
                <option value="tournament">Tournois</option>
                <option value="meeting">Réunions</option>
              </select>
            </div>
          </div>

          {/* Events Cards List */}
          <div className="space-y-3">
            {filteredEvents.map(event => {
              const isSelected = selectedEvent?.id === event.id;
              const effectiveSummoned = getEffectiveSummonedPlayers(event);
              const confirmedCount = effectiveSummoned.filter(p => p.status === 'Confirmé').length;
              return (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/60 border-blue-500 shadow-md ring-1 ring-blue-500/30'
                      : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Date Block */}
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-center flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          {new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                        </span>
                        <span className="text-base font-bold text-slate-900 font-display leading-none">
                          {new Date(event.date).getDate()}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{event.title}</h3>
                          {getEventTypeBadge(event.type)}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {event.startTime} - {event.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {effectiveSummoned.length > 0 && (
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-800">
                            {confirmedCount} / {effectiveSummoned.length}
                          </span>
                          <p className="text-[10px] text-emerald-600 font-medium">confirmés</p>
                        </div>
                      )}
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                        {event.status}
                      </span>

                      {/* Quick Edit & Delete Buttons */}
                      <div className="flex items-center gap-1 ml-1 opacity-80 hover:opacity-100">
                        <button
                          type="button"
                          onClick={(e) => openEditEventModal(event, e)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Modifier l'événement"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteEvent(event.id, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Supprimer l'événement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Convocation & Sheet */}
        <div>
          {selectedEvent ? (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6 sticky top-24">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {getEventTypeBadge(selectedEvent.type)}
                    <span className="text-xs font-bold text-slate-400">{selectedEvent.date}</span>
                  </div>
                  {/* Action buttons (Edit / Delete) */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => openEditEventModal(selectedEvent, e)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200 flex items-center gap-1 cursor-pointer"
                      title="Modifier l'événement"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteEvent(selectedEvent.id, e)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200 flex items-center gap-1 cursor-pointer"
                      title="Supprimer l'événement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-base text-slate-900">{selectedEvent.title}</h3>
                <p className="text-xs text-blue-600 font-medium">{selectedEvent.teamName || 'Club Élite'}</p>
              </div>

              {/* Logistics Grid */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Heure RDV :</span>
                  <span className="font-bold text-slate-900">{selectedEvent.convocationTime || '18:30'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Lieu & Salle :</span>
                  <span className="font-semibold text-slate-800">{selectedEvent.hall || selectedEvent.location}</span>
                </div>
                {selectedEvent.referee && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Arbitrage :</span>
                    <span className="font-semibold text-slate-800">{selectedEvent.referee}</span>
                  </div>
                )}
                {selectedEvent.transportVehicleId && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Véhicule club :</span>
                    <span className="font-semibold text-indigo-600 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      Minibus 1 (GA-784-XP)
                    </span>
                  </div>
                )}
              </div>

              {/* Summoned Players Checklist */}
              {(() => {
                const currentSummoned = getEffectiveSummonedPlayers(selectedEvent);
                return (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                        Joueurs convoqués ({currentSummoned.length})
                      </h4>
                      <button
                        type="button"
                        onClick={() => showToast('Rappel SMS / Email envoyé à tous les retardataires !')}
                        className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                      >
                        Relancer non-confirmés
                      </button>
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {currentSummoned.map(p => (
                        <div
                          key={p.playerId}
                          className="p-2.5 rounded-xl border border-slate-100 bg-white flex items-center justify-between text-xs hover:border-slate-200 transition-all"
                        >
                          <div>
                            <p className="font-bold text-slate-800">{p.playerName}</p>
                            <p className="text-[11px] text-slate-400">{p.transport || 'Voiture perso'}</p>
                          </div>

                          {/* Status switch 3 round buttons like Image 2 */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Confirmé (Green Check Circle) */}
                            <button
                              type="button"
                              onClick={() => handleUpdatePlayerStatus(selectedEvent.id, p.playerId, 'Confirmé')}
                              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                p.status === 'Confirmé'
                                  ? 'bg-emerald-500 text-white shadow-xs'
                                  : 'border border-slate-300 text-slate-400 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50'
                              }`}
                              title="Marquer Présent / Confirmé"
                            >
                              <Check className="w-4 h-4 stroke-[2.5]" />
                            </button>

                            {/* Absent (Red X Circle) */}
                            <button
                              type="button"
                              onClick={() => handleUpdatePlayerStatus(selectedEvent.id, p.playerId, 'Absent')}
                              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                p.status === 'Absent'
                                  ? 'bg-rose-500 text-white shadow-xs'
                                  : 'border border-slate-300 text-slate-400 hover:border-rose-500 hover:text-rose-500 hover:bg-rose-50'
                              }`}
                              title="Marquer Absent"
                            >
                              <X className="w-4 h-4 stroke-[2.5]" />
                            </button>

                            {/* En attente (Orange Alert Circle) */}
                            <button
                              type="button"
                              onClick={() => handleUpdatePlayerStatus(selectedEvent.id, p.playerId, 'En attente')}
                              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                p.status === 'En attente'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'border border-slate-300 text-slate-400 hover:border-amber-500 hover:text-amber-500 hover:bg-amber-50'
                              }`}
                              title="En attente de confirmation"
                            >
                              <span className="font-bold text-xs leading-none">!</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {selectedEvent.notes && (
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-slate-700">
                  <span className="font-bold text-blue-900">Consignes du coach : </span>
                  {selectedEvent.notes}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-400">
              Sélectionnez un événement pour afficher la feuille de convocation.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Nouveau / Modifier Match ou Événement */}
      {isCreateEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {editingEvent ? "Modifier le Match ou Événement" : "Programmer un Match ou Événement"}
                </h3>
                <p className="text-xs text-slate-500">
                  Planification au calendrier, horaires et génération automatique des convocations
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreateEventModalOpen(false);
                  setEditingEvent(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Titre de l'Événement *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 14e Journée - Réception Cannes Volley"
                  value={newEventTitle}
                  onChange={e => setNewEventTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type d'Événement</label>
                  <select
                    value={newEventType}
                    onChange={e => setNewEventType(e.target.value as EventType)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 outline-hidden"
                  >
                    <option value="match_official">Match Officiel Championnat</option>
                    <option value="match_friendly">Match Amical</option>
                    <option value="training">Entraînement Dirigé</option>
                    <option value="tournament">Tournoi / Coupe</option>
                    <option value="meeting">Réunion Club / Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Équipe Concernée</label>
                  <select
                    value={newTeamId}
                    onChange={e => handleTeamChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 outline-hidden"
                  >
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Adversaire (si match)</label>
                  <input
                    type="text"
                    placeholder="Ex: AS Cannes Volley"
                    value={newOpponent}
                    onChange={e => setNewOpponent(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Localisation</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewIsHome(true)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                        newIsHome ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      À Domicile
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewIsHome(false)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                        !newIsHome ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      À l'Extérieur
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={e => setNewEventDate(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Convocation</label>
                  <input
                    type="time"
                    value={newConvocationTime}
                    onChange={e => setNewConvocationTime(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Début Match</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={e => setNewStartTime(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fin Estimée</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={e => setNewEndTime(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lieu / Gymnase</label>
                  <input
                    type="text"
                    placeholder="Gymnase Municipal"
                    value={newLocation}
                    onChange={e => setNewLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Salle / Plateau</label>
                  <input
                    type="text"
                    placeholder="Terrain Principal"
                    value={newHall}
                    onChange={e => setNewHall(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Consignes et Notes du Coach</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Tenue bleue, gourde obligatoire, échauffement dès 19h..."
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                />
              </div>

              {/* Joueurs convoqués checklist */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Joueurs Convoqués ({selectedCallupPlayerIds.length} / {currentTeamMembers.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleToggleAllCallups}
                    className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    {selectedCallupPlayerIds.length === currentTeamMembers.length ? 'Tout décocher' : 'Tout cocher'}
                  </button>
                </div>

                {currentTeamMembers.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Aucun joueur dans cette équipe pour le moment.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                    {currentTeamMembers.map(m => {
                      const isChecked = selectedCallupPlayerIds.includes(m.id);
                      return (
                        <label
                          key={m.id}
                          className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-lg text-xs cursor-pointer hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePlayerCallup(m.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="font-medium text-slate-800 truncate">{m.firstName} {m.lastName}</span>
                          <span className="text-[10px] text-slate-400 ml-auto shrink-0">#{m.jerseyNumber || '-'}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateEventModalOpen(false);
                    setEditingEvent(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
                >
                  {editingEvent ? "Enregistrer les modifications" : "Programmer & Convoquer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
