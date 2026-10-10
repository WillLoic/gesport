import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Check,
  HeartPulse,
  Users,
  Trophy,
  CheckCircle,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { AttendanceRecord, SportEvent } from '../../types';

export const AttendanceView: React.FC = () => {
  const { events, attendance, setAttendance, members, teams, showToast } = useClub();

  // Fallback events from competitions if events context is empty
  const defaultEvents: SportEvent[] = [
    {
      id: 'ev-1',
      title: 'Match vs AS Cannes Volley',
      type: 'match_official',
      teamId: 't1',
      teamName: 'Gesport (Senior Régionale)',
      opponent: 'AS Cannes Volley',
      isHome: true,
      date: '2026-10-15',
      startTime: '20:00',
      endTime: '22:00',
      convocationTime: '18:45',
      location: 'Gymnase Principal',
      status: 'Programmé',
      summonedPlayers: [
        { playerId: 'm1', playerName: 'Lucas Moreau', status: 'Confirmé', transport: 'Voiture perso' },
        { playerId: 'm2', playerName: 'Thomas Dubois', status: 'Confirmé', transport: 'Voiture perso' },
        { playerId: 'm3', playerName: 'Hugo Bernard', status: 'En attente', transport: 'Voiture perso' },
        { playerId: 'm4', playerName: 'Antoine Roux', status: 'Confirmé', transport: 'Voiture perso' },
        { playerId: 'm5', playerName: 'Julien Petit', status: 'Confirmé', transport: 'Voiture perso' },
      ],
    },
    {
      id: 'ev-2',
      title: 'Déplacement vs Stade Toulousain',
      type: 'match_official',
      teamId: 't1',
      teamName: 'Gesport (Senior Régionale)',
      opponent: 'Stade Toulousain',
      isHome: false,
      date: '2026-10-22',
      startTime: '19:30',
      endTime: '21:30',
      convocationTime: '17:30',
      location: 'Palais des Sports Toulouse',
      status: 'Programmé',
      summonedPlayers: [
        { playerId: 'm1', playerName: 'Lucas Moreau', status: 'Confirmé', transport: 'Voiture perso' },
        { playerId: 'm2', playerName: 'Thomas Dubois', status: 'Confirmé', transport: 'Voiture perso' },
        { playerId: 'm3', playerName: 'Hugo Bernard', status: 'Confirmé', transport: 'Voiture perso' },
        { playerId: 'm4', playerName: 'Antoine Roux', status: 'En attente', transport: 'Voiture perso' },
      ],
    },
    {
      id: 'ev-3',
      title: 'Choc vs Paris Volley',
      type: 'match_official',
      teamId: 't2',
      teamName: 'Élite Nationale 1 (M)',
      opponent: 'Paris Volley',
      isHome: true,
      date: '2026-11-02',
      startTime: '20:30',
      endTime: '22:30',
      convocationTime: '19:15',
      location: 'Gymnase Central',
      status: 'Programmé',
      summonedPlayers: [
        { playerId: 'm1', playerName: 'Lucas Moreau', status: 'Confirmé', transport: 'Voiture perso' },
        { playerId: 'm4', playerName: 'Antoine Roux', status: 'Confirmé', transport: 'Voiture perso' },
        { playerId: 'm5', playerName: 'Julien Petit', status: 'Confirmé', transport: 'Voiture perso' },
      ],
    },
  ];

  const allEvents = events.length > 0 ? events : defaultEvents;

  // Tri par ordre chronologique (du plus imminent au moins imminent)
  const sortedEvents = [...allEvents].sort((a, b) => {
    const timeA = new Date(`${a.date}T${a.startTime || '00:00'}`).getTime();
    const timeB = new Date(`${b.date}T${b.startTime || '00:00'}`).getTime();
    return timeA - timeB;
  });

  const [selectedEventId, setSelectedEventId] = useState<string>(sortedEvents[0]?.id || 'ev-1');

  useEffect(() => {
    if (sortedEvents.length > 0 && !selectedEventId) {
      setSelectedEventId(sortedEvents[0].id);
    }
  }, [sortedEvents, selectedEventId]);

  const selectedEvent = sortedEvents.find(e => e.id === selectedEventId) || sortedEvents[0];

  // Joueurs convoqués pour l'événement sélectionné (récupérés de la base de données)
  const summonedList = selectedEvent?.summonedPlayers && selectedEvent.summonedPlayers.length > 0
    ? selectedEvent.summonedPlayers.map(sp => {
        const foundMember = members.find(m => String(m.id) === String(sp.playerId) || m.id === sp.playerId);
        const dbFullName = foundMember ? `${foundMember.firstName} ${foundMember.lastName}` : (sp.playerName || 'Joueur');
        return {
          id: String(sp.playerId),
          fullName: dbFullName,
          position: foundMember?.position || 'Joueur Convoqué',
          jerseyNumber: foundMember?.jerseyNumber || 1,
        };
      })
    : (members.length > 0
        ? members.map(m => ({
            id: String(m.id),
            fullName: `${m.firstName} ${m.lastName}`,
            position: m.position || 'Joueur',
            jerseyNumber: m.jerseyNumber || 1,
          }))
        : [
            { id: 'm1', fullName: 'Lucas Moreau', position: 'Réceptionneur-Attaquant', jerseyNumber: 7 },
            { id: 'm2', fullName: 'Thomas Dubois', position: 'Passeur', jerseyNumber: 2 },
            { id: 'm3', fullName: 'Hugo Bernard', position: 'Central', jerseyNumber: 12 },
            { id: 'm4', fullName: 'Antoine Roux', position: 'Pointu', jerseyNumber: 9 },
            { id: 'm5', fullName: 'Julien Petit', position: 'Libero', jerseyNumber: 4 },
          ]);

  const handleSetStatus = (
    playerId: string,
    playerName: string,
    status: 'Présent' | 'Absent excusé' | 'Absent non-excusé' | 'En retard' | 'Blessé',
    delayMinutes = 0
  ) => {
    const existing = attendance.find(
      a => a.playerId === playerId && (a.eventId === selectedEvent?.id || a.date === selectedEvent?.date)
    );

    if (existing) {
      setAttendance(prev =>
        prev.map(a =>
          a.id === existing.id
            ? { ...a, status, delayMinutes: status === 'En retard' ? delayMinutes || 15 : undefined }
            : a
        )
      );
    } else {
      const newRec: AttendanceRecord = {
        id: `att-${Date.now()}-${playerId}`,
        eventId: selectedEvent?.id || 'ev-1',
        eventTitle: selectedEvent?.title || 'Événement',
        date: selectedEvent?.date || new Date().toISOString().split('T')[0],
        playerId,
        playerName,
        teamName: selectedEvent?.teamName || 'Équipe',
        status,
        delayMinutes: status === 'En retard' ? delayMinutes || 15 : undefined,
      };
      setAttendance(prev => [...prev, newRec]);
    }
    showToast(`Pointage enregistré pour ${playerName} : ${status}`);
  };

  const getPlayerStatus = (playerId: string) => {
    const record = attendance.find(
      a => a.playerId === playerId && (a.eventId === selectedEvent?.id || a.date === selectedEvent?.date)
    );
    return record?.status || 'Non pointé';
  };

  // Statistiques de pointage pour l'événement sélectionné
  const total = summonedList.length;
  const presentCount = summonedList.filter(m => getPlayerStatus(m.id) === 'Présent').length;
  const lateCount = summonedList.filter(m => getPlayerStatus(m.id) === 'En retard').length;
  const absentCount = summonedList.filter(
    m => getPlayerStatus(m.id) === 'Absent excusé' || getPlayerStatus(m.id) === 'Absent non-excusé'
  ).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Pointage & Présences par Événement</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Sélectionnez un événement de compétition pour émarger et vérifier la présence des joueurs convoqués
          </p>
        </div>

        {selectedEvent && (
          <button
            type="button"
            onClick={() => {
              summonedList.forEach(m => handleSetStatus(m.id, m.fullName, 'Présent'));
              showToast(`Tous les joueurs convoqués pour "${selectedEvent.title}" ont été marqués Présents !`);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer transition-all"
          >
            <Check className="w-4 h-4" />
            Pointer Tout le Monde Présent
          </button>
        )}
      </div>

      {/* Liste des Événements triés par ordre chronologique */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
          Événements de Compétition (Classés par ordre chronologique)
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {sortedEvents.map(ev => {
            const isSelected = selectedEventId === ev.id;
            return (
              <button
                key={ev.id}
                type="button"
                onClick={() => setSelectedEventId(ev.id)}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-900 text-white border-blue-900 shadow-md ring-2 ring-blue-500 ring-offset-2'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isSelected ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {ev.teamName}
                  </span>
                  <span
                    className={`text-[11px] font-semibold flex items-center gap-1 ${
                      isSelected ? 'text-blue-200' : 'text-slate-500'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    {ev.date}
                  </span>
                </div>

                <h3 className={`font-bold text-sm leading-snug mb-1.5 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {ev.title}
                </h3>

                <div className={`flex items-center gap-3 text-xs ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {ev.startTime || '20:00'}
                  </span>
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5" />
                    {ev.location || 'Stade Municipal'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Control Filters Bar for Selected Event */}
      {selectedEvent && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-900">{selectedEvent.title}</h2>
                <p className="text-xs text-slate-500">
                  {selectedEvent.teamName} • {selectedEvent.date} à {selectedEvent.startTime} • {selectedEvent.location}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-center">
              <CheckCircle className="w-3.5 h-3.5" />
              {summonedList.length} Joueur(s) Convoqué(s)
            </span>
          </div>

          {/* Real-time counters row */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <div className="p-3 rounded-xl bg-slate-50 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">TOTAL CONVOQUÉS</span>
              <p className="text-base font-bold text-slate-900">{total}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-700">PRÉSENTS</span>
              <p className="text-base font-bold text-emerald-700">{presentCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-700">RETARDS</span>
              <p className="text-base font-bold text-amber-700">{lateCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 text-center">
              <span className="text-[10px] uppercase font-bold text-rose-700">ABSENTS</span>
              <p className="text-base font-bold text-rose-700">{absentCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Pointage Kiosk Cards for Summoned Players */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
          Émargement des Joueurs Convoqués
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {summonedList.map(m => {
            const currentStatus = getPlayerStatus(m.id);

            return (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                    #{m.jerseyNumber || 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{m.fullName}</h3>
                    <p className="text-xs text-slate-500">{m.position || 'Joueur Convoqué'}</p>
                    <span
                      className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        currentStatus === 'Présent'
                          ? 'bg-emerald-100 text-emerald-800'
                          : currentStatus === 'En retard'
                          ? 'bg-amber-100 text-amber-800'
                          : currentStatus.includes('Absent')
                          ? 'bg-rose-100 text-rose-800'
                          : currentStatus === 'Blessé'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {currentStatus}
                    </span>
                  </div>
                </div>

                {/* Fast 1-touch buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleSetStatus(m.id, m.fullName, 'Présent')}
                    className={`px-3 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all ${
                      currentStatus === 'Présent'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    Présent
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetStatus(m.id, m.fullName, 'En retard', 15)}
                    className={`px-3 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all ${
                      currentStatus === 'En retard'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    Retard
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetStatus(m.id, m.fullName, 'Absent excusé')}
                    className={`px-3 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all ${
                      currentStatus === 'Absent excusé'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                    }`}
                  >
                    Absent
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetStatus(m.id, m.fullName, 'Blessé')}
                    className={`p-2 text-xs font-bold rounded-xl cursor-pointer transition-all ${
                      currentStatus === 'Blessé'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                    }`}
                    title="Marquer blessé / soins"
                  >
                    <HeartPulse className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

