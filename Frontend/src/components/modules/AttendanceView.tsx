import React, { useState } from 'react';
import {
  ClipboardCheck,
  Check,
  X,
  Clock,
  HeartPulse,
  Users,
  Search,
  Calendar,
  Shield,
  Download,
  AlertCircle,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { AttendanceRecord } from '../../types';

export const AttendanceView: React.FC = () => {
  const { attendance, setAttendance, members, teams, trainings, showToast } = useClub();

  const [selectedTeamId, setSelectedTeamId] = useState<string>('t1');
  const [selectedDate, setSelectedDate] = useState<string>('2025-02-25');
  const [selectedSessionName, setSelectedSessionName] = useState<string>('Séance N1M - Bloc-Défense');

  const teamMembers = members.filter(m => m.teamId === selectedTeamId);

  const handleSetStatus = (
    playerId: string,
    playerName: string,
    status: 'Présent' | 'Absent excusé' | 'Absent non-excusé' | 'En retard' | 'Blessé',
    delayMinutes = 0
  ) => {
    const existing = attendance.find(
      a => a.playerId === playerId && a.date === selectedDate
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
        eventId: 'tr1',
        eventTitle: selectedSessionName,
        date: selectedDate,
        playerId,
        playerName,
        teamName: teams.find(t => t.id === selectedTeamId)?.name || 'Équipe',
        status,
        delayMinutes: status === 'En retard' ? delayMinutes || 15 : undefined,
      };
      setAttendance(prev => [...prev, newRec]);
    }
    showToast(`Pointage enregistré pour ${playerName} : ${status}`);
  };

  const getPlayerStatus = (playerId: string) => {
    const record = attendance.find(a => a.playerId === playerId && a.date === selectedDate);
    return record?.status || 'Non pointé';
  };

  // Quick stats for the current team and date
  const total = teamMembers.length;
  const presentCount = teamMembers.filter(m => getPlayerStatus(m.id) === 'Présent').length;
  const lateCount = teamMembers.filter(m => getPlayerStatus(m.id) === 'En retard').length;
  const absentCount = teamMembers.filter(
    m => getPlayerStatus(m.id) === 'Absent excusé' || getPlayerStatus(m.id) === 'Absent non-excusé'
  ).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Présences & Pointage Rapide</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Émargement instantané des séances et matchs, mode tablette pour entraîneurs et suivi d'assiduité
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            teamMembers.forEach(m => handleSetStatus(m.id, `${m.firstName} ${m.lastName}`, 'Présent'));
            showToast('Tous les joueurs ont été marqués Présents !');
          }}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
        >
          <Check className="w-4 h-4" />
          Pointer Tout le Monde Présent
        </button>
      </div>

      {/* Control Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Équipe</label>
            <select
              value={selectedTeamId}
              onChange={e => setSelectedTeamId(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-700"
            >
              {teams.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Date de la séance</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Intitulé Séance</label>
            <input
              type="text"
              value={selectedSessionName}
              onChange={e => setSelectedSessionName(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-700"
            />
          </div>
        </div>

        {/* Real-time counters row */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          <div className="p-2.5 rounded-xl bg-slate-50 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Joueurs</span>
            <p className="text-sm font-bold text-slate-900">{total}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-700">Présents</span>
            <p className="text-sm font-bold text-emerald-700">{presentCount}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-center">
            <span className="text-[10px] uppercase font-bold text-amber-700">Retards</span>
            <p className="text-sm font-bold text-amber-700">{lateCount}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 text-center">
            <span className="text-[10px] uppercase font-bold text-rose-700">Absents</span>
            <p className="text-sm font-bold text-rose-700">{absentCount}</p>
          </div>
        </div>
      </div>

      {/* Pointage Kiosk Cards (Tablet & Touch Optimized) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {teamMembers.map(m => {
          const currentStatus = getPlayerStatus(m.id);
          const fullName = `${m.firstName} ${m.lastName}`;

          return (
            <div
              key={m.id}
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                  #{m.jerseyNumber}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{fullName}</h3>
                  <p className="text-xs text-slate-500">{m.position}</p>
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
                  onClick={() => handleSetStatus(m.id, fullName, 'Présent')}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                    currentStatus === 'Présent'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  Présent
                </button>

                <button
                  type="button"
                  onClick={() => handleSetStatus(m.id, fullName, 'En retard', 15)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                    currentStatus === 'En retard'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  Retard
                </button>

                <button
                  type="button"
                  onClick={() => handleSetStatus(m.id, fullName, 'Absent excusé')}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                    currentStatus === 'Absent excusé'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                  }`}
                >
                  Absent
                </button>

                <button
                  type="button"
                  onClick={() => handleSetStatus(m.id, fullName, 'Blessé')}
                  className={`p-2 text-xs font-bold rounded-xl transition-all ${
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
  );
};
