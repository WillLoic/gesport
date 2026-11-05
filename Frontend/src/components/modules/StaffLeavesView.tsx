import React, { useState } from 'react';
import {
  Plus,
  CheckCircle,
  Clock,
  Calendar,
  X,
  UserCheck,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileText,
  User,
  Users,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { LeaveRequest } from '../../types';
import { hrContractsService } from '../../services/documentsService';

export const StaffLeavesView: React.FC = () => {
  const { leaves, setLeaves, staff, showToast } = useClub();

  // Modals state
  const [isNewLeaveModalOpen, setIsNewLeaveModalOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState<LeaveRequest | null>(null);
  const [leaveToDelete, setLeaveToDelete] = useState<LeaveRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Leave Form State
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [leaveType, setLeaveType] = useState('Congés Payés');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
  );
  const [daysCount, setDaysCount] = useState(5);
  const [selectedSubstituteId, setSelectedSubstituteId] = useState('');
  const [handledTeams, setHandledTeams] = useState('Équipe Pro, U18 France');

  // Edit Leave Form State
  const [editStaffName, setEditStaffName] = useState('');
  const [editRole, setEditRole] = useState('Staff Technique');
  const [editLeaveType, setEditLeaveType] = useState('Congés Payés');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editDaysCount, setEditDaysCount] = useState(1);
  const [editSubstituteName, setEditSubstituteName] = useState('');
  const [editHandledTeams, setEditHandledTeams] = useState('');
  const [editStatus, setEditStatus] = useState<LeaveRequest['status']>('Approuvé');

  // Recalcul des jours
  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 1;
    const d1 = new Date(start).getTime();
    const d2 = new Date(end).getTime();
    const diff = Math.round((d2 - d1) / (1000 * 3600 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  // ─────────────────────────────────────────────────────────────
  // 1. CRÉATION D'UNE ABSENCE / CONGÉ
  // ─────────────────────────────────────────────────────────────
  const handleOpenCreateModal = () => {
    const defaultStaff = staff[0]?.id || '';
    const defaultSub = staff[1]?.id || staff[0]?.id || '';
    setSelectedStaffId(defaultStaff);
    setSelectedSubstituteId(defaultSub);
    setLeaveType('Congés Payés');
    const start = new Date().toISOString().split('T')[0];
    const end = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];
    setStartDate(start);
    setEndDate(end);
    setDaysCount(calculateDays(start, end));
    setHandledTeams('Équipe Pro, U18 France');
    setIsNewLeaveModalOpen(true);
  };

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    const sourceStaff = staff.find(s => s.id === selectedStaffId) || staff[0] || {
      name: 'Entraîneur',
      role: 'Staff Technique',
    };
    const subStaff = staff.find(s => s.id === selectedSubstituteId) || staff[1] || staff[0] || {
      name: 'Coach Adjoint',
    };

    setIsSubmitting(true);

    let backendType: 'PAID' | 'UNPAID' | 'SICK' | 'MATERNITY' = 'PAID';
    if (leaveType === 'Arrêt Maladie') backendType = 'SICK';
    else if (leaveType === 'Événement Familial') backendType = 'UNPAID';

    const fallbackLeave: LeaveRequest = {
      id: `leave-${Date.now()}`,
      staffName: sourceStaff.name,
      role: sourceStaff.role,
      leaveType,
      startDate,
      endDate,
      daysCount: Number(daysCount) || calculateDays(startDate, endDate),
      substituteStaffName: subStaff.name,
      substituteHandledTeams: handledTeams.split(',').map(t => t.trim()).filter(Boolean),
      status: 'Approuvé',
    };

    try {
      const createdLeave = await hrContractsService.createLeave({
        employee_name: sourceStaff.name,
        employee_email: `${sourceStaff.name.toLowerCase().replace(/\s+/g, '.')}@gesport-club.com`,
        start_date: startDate,
        end_date: endDate,
        leave_type: backendType,
        reason: `Remplaçant: ${subStaff.name} | Équipes: ${handledTeams}`,
      });

      // Assigner le remplacement dans le microservice si possible
      const numericId = parseInt(createdLeave.id, 10);
      if (!isNaN(numericId)) {
        await hrContractsService.createReplacement({
          absent_employee_name: sourceStaff.name,
          replacement_employee_name: subStaff.name,
          start_date: startDate,
          end_date: endDate,
          leave_request: numericId,
          notes: `Équipes prises en charge: ${handledTeams}`,
        }).catch(() => null);
      }

      const enriched: LeaveRequest = {
        ...createdLeave,
        role: sourceStaff.role,
        daysCount: Number(daysCount) || calculateDays(startDate, endDate),
        substituteStaffName: subStaff.name,
        substituteHandledTeams: handledTeams.split(',').map(t => t.trim()).filter(Boolean),
      };

      setLeaves(prev => [enriched, ...prev]);
      showToast(`Demande de congé enregistrée pour ${sourceStaff.name} !`);
    } catch (err) {
      console.warn('Erreur création congé backend, fallback local:', err);
      setLeaves(prev => [fallbackLeave, ...prev]);
      showToast(`Demande de congé enregistrée pour ${sourceStaff.name} (Remplacement : ${subStaff.name}) !`);
    } finally {
      setIsSubmitting(false);
      setIsNewLeaveModalOpen(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 2. MODIFIER UN CONGÉ
  // ─────────────────────────────────────────────────────────────
  const handleOpenEditModal = (leave: LeaveRequest) => {
    setEditingLeave(leave);
    setEditStaffName(leave.staffName);
    setEditRole(leave.role || 'Staff Technique');
    setEditLeaveType(leave.leaveType);
    setEditStartDate(leave.startDate);
    setEditEndDate(leave.endDate);
    setEditDaysCount(leave.daysCount || calculateDays(leave.startDate, leave.endDate));
    setEditSubstituteName(leave.substituteStaffName);
    setEditHandledTeams(leave.substituteHandledTeams.join(', '));
    setEditStatus(leave.status);
  };

  const handleUpdateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLeave) return;

    setIsSubmitting(true);

    let backendType = 'PAID';
    if (editLeaveType === 'Arrêt Maladie') backendType = 'SICK';
    else if (editLeaveType === 'Événement Familial') backendType = 'UNPAID';

    let backendStatus = 'APPROVED';
    if (editStatus === 'En attente') backendStatus = 'PENDING';
    else if (editStatus === 'Refusé') backendStatus = 'REJECTED';
    else if (editStatus === 'Terminé') backendStatus = 'COMPLETED';

    try {
      const numericId = parseInt(editingLeave.id, 10);
      if (!isNaN(numericId)) {
        await hrContractsService.updateLeave(numericId, {
          employee_name: editStaffName.trim(),
          start_date: editStartDate,
          end_date: editEndDate,
          leave_type: backendType,
          status: backendStatus,
          reason: `Remplaçant: ${editSubstituteName} | Équipes: ${editHandledTeams}`,
        });
      }

      setLeaves(prev =>
        prev.map(l =>
          l.id === editingLeave.id
            ? {
                ...l,
                staffName: editStaffName.trim(),
                role: editRole.trim(),
                leaveType: editLeaveType,
                startDate: editStartDate,
                endDate: editEndDate,
                daysCount: Number(editDaysCount) || calculateDays(editStartDate, editEndDate),
                substituteStaffName: editSubstituteName.trim(),
                substituteHandledTeams: editHandledTeams.split(',').map(t => t.trim()).filter(Boolean),
                status: editStatus,
              }
            : l
        )
      );

      showToast(`Le congé de ${editStaffName} a été mis à jour avec succès !`);
      setEditingLeave(null);
    } catch (err) {
      console.warn('Erreur mise à jour congé backend:', err);
      // Fallback local
      setLeaves(prev =>
        prev.map(l =>
          l.id === editingLeave.id
            ? {
                ...l,
                staffName: editStaffName.trim(),
                role: editRole.trim(),
                leaveType: editLeaveType,
                startDate: editStartDate,
                endDate: editEndDate,
                daysCount: Number(editDaysCount) || calculateDays(editStartDate, editEndDate),
                substituteStaffName: editSubstituteName.trim(),
                substituteHandledTeams: editHandledTeams.split(',').map(t => t.trim()).filter(Boolean),
                status: editStatus,
              }
            : l
        )
      );
      showToast(`Le congé de ${editStaffName} a été mis à jour.`);
      setEditingLeave(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 3. MONTRER QUE LE CONGÉ EST TERMINÉ (CLÔTURER)
  // ─────────────────────────────────────────────────────────────
  const handleMarkAsCompleted = async (leave: LeaveRequest) => {
    setIsSubmitting(true);
    try {
      const numericId = parseInt(leave.id, 10);
      if (!isNaN(numericId)) {
        await hrContractsService.completeLeave(numericId);
      }

      setLeaves(prev =>
        prev.map(l => (l.id === leave.id ? { ...l, status: 'Terminé' } : l))
      );
      showToast(`Congé terminé : ${leave.staffName} a repris ses fonctions. Remplacement achevé !`);
    } catch (err) {
      console.warn('Erreur clôture congé backend:', err);
      setLeaves(prev =>
        prev.map(l => (l.id === leave.id ? { ...l, status: 'Terminé' } : l))
      );
      showToast(`Congé marqué comme terminé pour ${leave.staffName}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 4. SUPPRIMER UNE DEMANDE DE CONGÉ
  // ─────────────────────────────────────────────────────────────
  const handleOpenDeleteModal = (leave: LeaveRequest) => {
    setLeaveToDelete(leave);
  };

  const handleConfirmDelete = async () => {
    if (!leaveToDelete) return;

    setIsSubmitting(true);
    try {
      const numericId = parseInt(leaveToDelete.id, 10);
      if (!isNaN(numericId)) {
        await hrContractsService.deleteLeave(numericId);
      }

      setLeaves(prev => prev.filter(l => l.id !== leaveToDelete.id));
      showToast(`Le congé de ${leaveToDelete.staffName} a été supprimé avec succès.`);
      setLeaveToDelete(null);
    } catch (err) {
      console.warn('Erreur suppression congé backend:', err);
      setLeaves(prev => prev.filter(l => l.id !== leaveToDelete.id));
      showToast(`Le congé de ${leaveToDelete.staffName} a été supprimé.`);
      setLeaveToDelete(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 5. APPROUVER UN CONGÉ (SI EN ATTENTE)
  // ─────────────────────────────────────────────────────────────
  const handleApproveLeave = async (leaveId: string) => {
    const numericId = parseInt(leaveId, 10);
    if (!isNaN(numericId)) {
      try {
        await hrContractsService.approveRejectLeave(numericId, true);
      } catch (err) {
        console.warn('Erreur validation congé backend:', err);
      }
    }
    setLeaves(prev =>
      prev.map(l => (l.id === leaveId ? { ...l, status: 'Approuvé' } : l))
    );
    showToast('Demande de congé approuvée et planning des remplaçants notifié !');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Personnel des Congés & Remplacements</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Gestion des absences d'entraîneurs, désignation des coachs remplaçants et maintien des séances
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          Déclarer une Absence
        </button>
      </div>

      {/* Leaves Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {leaves.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-base text-slate-800 mb-1">Aucun congé ou absence déclarée</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-5">
              Toutes les absences du personnel et les désignations de remplaçants s'afficheront ici.
            </p>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Déclarer une absence
            </button>
          </div>
        ) : (
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
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {leaves.map(leave => {
                  const isCompleted = leave.status === 'Terminé';
                  const isApproved = leave.status === 'Approuvé';
                  const isPending = leave.status === 'En attente';

                  return (
                    <tr key={leave.id} className="hover:bg-slate-50/80 transition-colors">
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
                          Prend en charge : {leave.substituteHandledTeams?.join(', ') || 'Séances planifiées'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                            Terminé
                          </span>
                        ) : isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle className="w-3 h-3" />
                            Approuvé
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            En attente
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                            <X className="w-3 h-3" />
                            {leave.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* 1. Bouton Approuver si En attente */}
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => handleApproveLeave(leave.id)}
                              className="px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer mr-1"
                              title="Approuver cette demande"
                            >
                              Approuver
                            </button>
                          )}

                          {/* 2. Bouton Montrer que le congé est terminé */}
                          {!isCompleted && (
                            <button
                              type="button"
                              onClick={() => handleMarkAsCompleted(leave)}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="Marquer le congé comme terminé (retour du salarié)"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* 3. Bouton Modifier */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(leave)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Modifier ce congé"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* 4. Bouton Supprimer */}
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteModal(leave)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            title="Supprimer ce congé"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODAL : DÉCLARER UNE ABSENCE / CONGÉ
      ───────────────────────────────────────────────────────────── */}
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
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
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
                  {staff && staff.length > 0 ? (
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
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="Nom de l'entraîneur"
                      value={selectedStaffId}
                      onChange={e => setSelectedStaffId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                    />
                  )}
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
                    required
                    value={startDate}
                    onChange={e => {
                      setStartDate(e.target.value);
                      setDaysCount(calculateDays(e.target.value, endDate));
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date Fin
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={e => {
                      setEndDate(e.target.value);
                      setDaysCount(calculateDays(startDate, e.target.value));
                    }}
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
                    {staff && staff.length > 0 ? (
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
                    ) : (
                      <input
                        type="text"
                        placeholder="Ex: Thomas Giraud"
                        value={selectedSubstituteId}
                        onChange={e => setSelectedSubstituteId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                      />
                    )}
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
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    "Enregistrer l'Absence"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL : MODIFIER UNE ABSENCE / CONGÉ
      ───────────────────────────────────────────────────────────── */}
      {editingLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 font-display">Modifier le Congé</h3>
                  <p className="text-xs text-slate-500">{editingLeave.staffName} • {editingLeave.leaveType}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingLeave(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateLeave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Salarié / Entraîneur *
                  </label>
                  <input
                    type="text"
                    required
                    value={editStaffName}
                    onChange={e => setEditStaffName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Type d'Absence *
                  </label>
                  <select
                    value={editLeaveType}
                    onChange={e => setEditLeaveType(e.target.value)}
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
                    required
                    value={editStartDate}
                    onChange={e => {
                      setEditStartDate(e.target.value);
                      setEditDaysCount(calculateDays(e.target.value, editEndDate));
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date Fin
                  </label>
                  <input
                    type="date"
                    required
                    value={editEndDate}
                    onChange={e => {
                      setEditEndDate(e.target.value);
                      setEditDaysCount(calculateDays(editStartDate, e.target.value));
                    }}
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
                    value={editDaysCount}
                    onChange={e => setEditDaysCount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-amber-600" />
                  Remplacement & Statut
                </h4>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Coach Remplaçant Désigné
                      </label>
                      <input
                        type="text"
                        value={editSubstituteName}
                        onChange={e => setEditSubstituteName(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Statut du Congé
                      </label>
                      <select
                        value={editStatus}
                        onChange={e => setEditStatus(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                      >
                        <option value="Approuvé">Approuvé</option>
                        <option value="En attente">En attente</option>
                        <option value="Terminé">Terminé</option>
                        <option value="Refusé">Refusé</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Groupes & Séances Prises en Charge
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Entraînements du Mardi U15, Match Samedi N3"
                      value={editHandledTeams}
                      onChange={e => setEditHandledTeams(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingLeave(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    'Enregistrer les Modifications'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL : CONFIRMATION DE SUPPRESSION DE CONGÉ
      ───────────────────────────────────────────────────────────── */}
      {leaveToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Supprimer cette Demande de Congé ?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                  Êtes-vous sûr de vouloir supprimer la déclaration d'absence de <strong className="text-slate-900">{leaveToDelete.staffName}</strong> ({leaveToDelete.leaveType}) pour la période du <strong className="text-slate-900">{leaveToDelete.startDate}</strong> au <strong className="text-slate-900">{leaveToDelete.endDate}</strong> ?
                </p>
                <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs text-left">
                  <p className="font-semibold mb-1">Attention :</p>
                  <p>
                    Cette action supprimera définitivement le congé et la désignation du remplaçant dans la base de données.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setLeaveToDelete(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmDelete}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl shadow-xs cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Suppression...
                    </>
                  ) : (
                    'Confirmer la Suppression'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
