import React, { useState } from 'react';
import {
  Plus,
  CheckCircle,
  Clock,
  Calendar,
  X,
  UserCheck,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { LeaveRequest } from '../../types';

export const StaffLeavesView: React.FC = () => {
  const { leaves, setLeaves, staff, showToast } = useClub();
  const [isNewLeaveModalOpen, setIsNewLeaveModalOpen] = useState(false);

  // New Leave Form State
  const [selectedStaffId, setSelectedStaffId] = useState(staff[0]?.id || 's1');
  const [leaveType, setLeaveType] = useState('Congés Payés');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
  );
  const [daysCount, setDaysCount] = useState(5);
  const [selectedSubstituteId, setSelectedSubstituteId] = useState(staff[1]?.id || staff[0]?.id || 's2');
  const [handledTeams, setHandledTeams] = useState('Équipe Pro, U18 France');

  const handleApproveLeave = (leaveId: string) => {
    setLeaves(prev =>
      prev.map(l => (l.id === leaveId ? { ...l, status: 'Approuvé' } : l))
    );
    showToast('Demande de congé approuvée et planning des remplaçants notifié !');
  };

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const sourceStaff = staff.find(s => s.id === selectedStaffId) || staff[0];
    const subStaff = staff.find(s => s.id === selectedSubstituteId) || staff[1] || staff[0];

    const newLeave: LeaveRequest = {
      id: `leave-${Date.now()}`,
      staffName: sourceStaff.name,
      role: sourceStaff.role,
      leaveType: leaveType as any,
      startDate,
      endDate,
      daysCount: Number(daysCount) || 1,
      substituteStaffName: subStaff.name,
      substituteHandledTeams: handledTeams.split(',').map(t => t.trim()).filter(Boolean),
      status: 'En attente',
    };

    setLeaves(prev => [newLeave, ...prev]);
    setIsNewLeaveModalOpen(false);
    showToast(`Demande de congé enregistrée pour ${sourceStaff.name} (Remplacement : ${subStaff.name}) !`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Congés & Remplacements Staff</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Gestion des absences d'entraîneurs, désignation des coachs remplaçants et maintien des séances
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewLeaveModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          Déclarer une Absence
        </button>
      </div>

      {/* Leaves Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Salarié / Entraîneur</th>
                <th className="py-3 px-4">Type de Congé</th>
                <th className="py-3 px-4">Période</th>
                <th className="py-3 px-4 text-center">Durée</th>
                <th className="py-3 px-4">Coach Remplaçant Désigné</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {leaves.map(leave => (
                <tr key={leave.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{leave.staffName}</div>
                    <div className="text-xs text-slate-500">{leave.role}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{leave.leaveType}</td>
                  <td className="py-3 px-4 text-slate-600">
                    {leave.startDate} au {leave.endDate}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-800">{leave.daysCount} j</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-blue-700">{leave.substituteStaffName}</div>
                    <div className="text-[11px] text-slate-400">
                      Prend en charge : {leave.substituteHandledTeams.join(', ')}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        leave.status === 'Approuvé'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {leave.status === 'Approuvé' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      <span>{leave.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {leave.status === 'En attente' && (
                      <button
                        type="button"
                        onClick={() => handleApproveLeave(leave.id)}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
                      >
                        Approuver
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Leave Declaration Modal */}
      {isNewLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 font-display">Déclarer une Absence / Congé</h3>
                  <p className="text-xs text-slate-500">Organisation de l'intérim et de la continuité des entraînements</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewLeaveModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLeave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Membre du Staff Absent *
                  </label>
                  <select
                    value={selectedStaffId}
                    onChange={e => setSelectedStaffId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Type d'Absence *
                  </label>
                  <select
                    value={leaveType}
                    onChange={e => setLeaveType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    <option value="Congés Payés">Congés Payés</option>
                    <option value="Arrêt Maladie">Arrêt Maladie</option>
                    <option value="Stage / Formation Fédérale">Stage / Formation Fédérale</option>
                    <option value="Événement Familial">Événement Familial</option>
                    <option value="Récupération Heures Match">Récupération Heures Match</option>
                    <option value="Autre motif">Autre motif</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date Début
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date Fin
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nombre Jours
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={daysCount}
                    onChange={e => setDaysCount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  Continuité Pédagogique & Remplacement
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Coach / Éducateur Remplaçant Désigné
                    </label>
                    <select
                      value={selectedSubstituteId}
                      onChange={e => setSelectedSubstituteId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                    >
                      {staff.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Groupes & Séances Prises en Charge
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Entraînements du Mardi U15, Match Samedi N3"
                      value={handledTeams}
                      onChange={e => setHandledTeams(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewLeaveModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors"
                >
                  Enregistrer l'Absence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
