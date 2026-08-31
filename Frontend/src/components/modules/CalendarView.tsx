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
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { SportEvent, EventType } from '../../types';

export const CalendarView: React.FC = () => {
  const { events, setEvents, teams, members, vehicles, showToast } = useClub();

  const [currentView, setCurrentView] = useState<'month' | 'week' | 'list'>('month');
  const [selectedEvent, setSelectedEvent] = useState<SportEvent | null>(events[0] || null);
  const [filterType, setFilterType] = useState<string>('all');
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);

  // New Event Form States
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState<EventType>('match_official');
  const [newTeamId, setNewTeamId] = useState(teams[0]?.id || 't1');
  const [newOpponent, setNewOpponent] = useState('');
  const [newIsHome, setNewIsHome] = useState(true);
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStartTime, setNewStartTime] = useState('20:00');
  const [newEndTime, setNewEndTime] = useState('22:00');
  const [newConvocationTime, setNewConvocationTime] = useState('18:45');
  const [newLocation, setNewLocation] = useState('Gymnase Principal');
  const [newHall, setNewHall] = useState('Terrain A');
  const [newNotes, setNewNotes] = useState('');

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) {
      showToast('Veuillez donner un titre à l\'événement.');
      return;
    }

    const assignedTeam = teams.find(t => t.id === newTeamId) || teams[0];
    const teamSquad = members.filter(m => m.teamId === assignedTeam?.id);

    const newEv: SportEvent = {
      id: `e-${Date.now()}`,
      title: newEventTitle.trim(),
      type: newEventType,
      teamId: assignedTeam ? assignedTeam.id : 't1',
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
      status: 'Programmé',
      summonedPlayers: teamSquad.map(m => ({
        playerId: m.id,
        playerName: `${m.firstName} ${m.lastName}`,
        status: 'En attente',
        transport: 'Voiture perso',
      })),
    };

    setEvents(prev => [newEv, ...prev]);
    setSelectedEvent(newEv);
    setIsCreateEventModalOpen(false);
    showToast(`Événement "${newEv.title}" ajouté au calendrier et convocations envoyées !`);
    setNewEventTitle('');
    setNewOpponent('');
    setNewNotes('');
  };

  const filteredEvents = events.filter(e => {
    if (filterType === 'all') return true;
    return e.type === filterType;
  });

  const handleUpdatePlayerStatus = (eventId: string, playerId: string, newStatus: any) => {
    setEvents(prev =>
      prev.map(ev => {
        if (ev.id === eventId) {
          const updatedSummoned = ev.summonedPlayers.map(p => {
            if (p.playerId === playerId) {
              return { ...p, status: newStatus };
            }
            return p;
          });
          return { ...ev, summonedPlayers: updatedSummoned };
        }
        return ev;
      })
    );
    if (selectedEvent && selectedEvent.id === eventId) {
      setSelectedEvent(prev => {
        if (!prev) return null;
        return {
          ...prev,
          summonedPlayers: prev.summonedPlayers.map(p =>
            p.playerId === playerId ? { ...p, status: newStatus } : p
          ),
        };
      });
    }
    showToast('Statut de convocation du joueur actualisé !');
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
            onClick={() => setIsCreateEventModalOpen(true)}
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
              const confirmedCount = event.summonedPlayers.filter(p => p.status === 'Confirmé').length;
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
                      {event.summonedPlayers.length > 0 && (
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-800">
                            {confirmedCount} / {event.summonedPlayers.length}
                          </span>
                          <p className="text-[10px] text-emerald-600 font-medium">confirmés</p>
                        </div>
                      )}
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                        {event.status}
                      </span>
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
                  {getEventTypeBadge(selectedEvent.type)}
                  <span className="text-xs font-bold text-slate-400">{selectedEvent.date}</span>
                </div>
                <h3 className="font-bold text-base text-slate-900">{selectedEvent.title}</h3>
                <p className="text-xs text-blue-600 font-medium">{selectedEvent.teamName || 'Club Élite'}</p>
              </div>

              {/* Logistics Grid */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Heure RDV :</span>
                  <span className="font-bold text-slate-900">{selectedEvent.convocationTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Lieu & Salle :</span>
                  <span className="font-semibold text-slate-800">{selectedEvent.hall}</span>
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
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Joueurs convoqués ({selectedEvent.summonedPlayers.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => showToast('Rappel SMS / Email envoyé à tous les retardataires !')}
                    className="text-[11px] font-semibold text-blue-600 hover:underline"
                  >
                    Relancer non-confirmés
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {selectedEvent.summonedPlayers.map(p => (
                    <div
                      key={p.playerId}
                      className="p-2.5 rounded-xl border border-slate-100 bg-white flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{p.playerName}</p>
                        <p className="text-[11px] text-slate-400">{p.transport}</p>
                      </div>

                      {/* Status switch buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdatePlayerStatus(selectedEvent.id, p.playerId, 'Confirmé')}
                          className={`p-1 rounded-lg ${
                            p.status === 'Confirmé'
                              ? 'bg-emerald-500 text-white'
                              : 'text-slate-400 hover:bg-slate-100'
                          }`}
                          title="Confirmer présent"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdatePlayerStatus(selectedEvent.id, p.playerId, 'Absent')}
                          className={`p-1 rounded-lg ${
                            p.status === 'Absent'
                              ? 'bg-rose-500 text-white'
                              : 'text-slate-400 hover:bg-slate-100'
                          }`}
                          title="Marquer absent"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdatePlayerStatus(selectedEvent.id, p.playerId, 'En attente')}
                          className={`p-1 rounded-lg ${
                            p.status === 'En attente'
                              ? 'bg-amber-500 text-white'
                              : 'text-slate-400 hover:bg-slate-100'
                          }`}
                          title="En attente de réponse"
                        >
                          <AlertCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

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

      {/* Modal: Nouveau Match / Événement / Convocation */}
      {isCreateEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-base text-slate-900">Programmer un Match ou Événement</h3>
                <p className="text-xs text-slate-500">Planification au calendrier, horaires et génération automatique des convocations</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateEventModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
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

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateEventModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Programmer & Convoquer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
