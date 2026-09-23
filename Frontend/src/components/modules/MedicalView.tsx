import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  AlertTriangle,
  Plus,
  Calendar,
  CheckCircle,
  Activity,
  User,
  Clock,
  FileText,
  X,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { MedicalRecord } from '../../types';
import { medicalService } from '../../services/medicalService';

export const MedicalView: React.FC = () => {
  const { medicalRecords, setMedicalRecords, members, teams, showToast } = useClub();
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(medicalRecords[0] || null);
  const [isNewInjuryModalOpen, setIsNewInjuryModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);

  // Sync selected record when medicalRecords change
  useEffect(() => {
    if (medicalRecords.length > 0 && (!selectedRecord || !medicalRecords.some(r => r.id === selectedRecord.id))) {
      setSelectedRecord(medicalRecords[0]);
    } else if (medicalRecords.length === 0) {
      setSelectedRecord(null);
    }
  }, [medicalRecords]);

  // Derived selected team name
  const selectedMember = selectedRecord ? members.find(m => String(m.id) === String(selectedRecord.playerId)) : null;
  const selectedTeamName = selectedMember?.teamName && selectedMember.teamName !== 'Sans équipe'
    ? selectedMember.teamName
    : (selectedRecord?.teamName && selectedRecord.teamName !== 'Équipe 1' ? selectedRecord.teamName : 'Sans équipe');

  // Form State (empty defaults by default)
  const [newMemberId, setNewMemberId] = useState(members[0]?.id || '1');
  const [newInjuryType, setNewInjuryType] = useState('');
  const [newInjuryDate, setNewInjuryDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEstimatedReturnDate, setNewEstimatedReturnDate] = useState('');
  const [newStatus, setNewStatus] = useState<'Indisponible' | 'Réathlétisation' | 'Apte avec réserve'>('Indisponible');
  const [newPractitioner, setNewPractitioner] = useState('');
  const [newProtocol, setNewProtocol] = useState('');

  const openCreateModal = () => {
    setEditingRecord(null);
    setNewMemberId(members[0]?.id || '1');
    setNewInjuryType('');
    setNewInjuryDate(new Date().toISOString().split('T')[0]);
    setNewEstimatedReturnDate('');
    setNewStatus('Indisponible');
    setNewPractitioner('');
    setNewProtocol('');
    setIsNewInjuryModalOpen(true);
  };

  const openEditModal = (record: MedicalRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingRecord(record);
    setNewMemberId(record.playerId || members[0]?.id || '1');
    setNewInjuryType(record.injuryType || '');
    setNewInjuryDate(record.injuryDate || new Date().toISOString().split('T')[0]);
    setNewEstimatedReturnDate(record.estimatedReturnDate || '');
    setNewStatus((record.status === 'Guéri / Feu vert' ? 'Apte avec réserve' : record.status) as any);
    setNewPractitioner('');
    setNewProtocol(record.physioNotes || record.prescribedCare || '');
    setIsNewInjuryModalOpen(true);
  };

  const handleDeleteInjury = async (recordId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const recordToDelete = medicalRecords.find(r => r.id === recordId);
    if (!recordToDelete) return;

    if (!window.confirm(`Voulez-vous vraiment supprimer le dossier médical de "${recordToDelete.playerName}" ?`)) {
      return;
    }

    try {
      await medicalService.deleteMedicalRecord(recordId);
    } catch (err) {
      console.warn('Erreur suppression dossier médical:', err);
    }

    setMedicalRecords(prev => prev.filter(r => r.id !== recordId));
    if (selectedRecord?.id === recordId) {
      const remaining = medicalRecords.filter(r => r.id !== recordId);
      setSelectedRecord(remaining[0] || null);
    }
    showToast(`Dossier médical de "${recordToDelete.playerName}" supprimé !`);
  };

  const handleUpdateStatus = async (recordId: string, status: any) => {
    const recordToUpdate = medicalRecords.find(r => r.id === recordId);
    if (!recordToUpdate) return;

    const updatedData = { ...recordToUpdate, status };

    try {
      const updated = await medicalService.updateMedicalRecord(recordId, updatedData);
      setMedicalRecords(prev =>
        prev.map(r => (r.id === recordId ? updated : r))
      );
      if (selectedRecord && selectedRecord.id === recordId) {
        setSelectedRecord(updated);
      }
      showToast(`Statut médical mis à jour : ${status}`);
    } catch (err) {
      setMedicalRecords(prev =>
        prev.map(r => (r.id === recordId ? updatedData : r))
      );
      if (selectedRecord && selectedRecord.id === recordId) {
        setSelectedRecord(updatedData);
      }
      showToast(`Statut médical mis à jour : ${status}`);
    }
  };

  const handleSaveInjury = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInjuryType.trim()) {
      showToast('Veuillez renseigner le diagnostic / type de blessure.');
      return;
    }

    const notesText = newPractitioner.trim()
      ? `${newProtocol.trim()} — Suivi par : ${newPractitioner.trim()}`
      : newProtocol.trim();

    const targetMember = members.find(m => m.id === newMemberId) || members[0];
    const targetTeam = targetMember ? teams.find(t => t.id === targetMember.teamId) : null;
    const memberTeamName = targetTeam ? targetTeam.name : (targetMember?.teamName || 'Sans équipe');

    const recordPayload: Partial<MedicalRecord> = {
      playerId: targetMember ? targetMember.id : '1',
      playerName: targetMember ? `${targetMember.firstName} ${targetMember.lastName}` : 'Licencié',
      teamName: memberTeamName,
      injuryType: newInjuryType.trim(),
      bodyPart: 'Membre inférieur',
      severity: 'Modérée (1-4 sem)',
      injuryDate: newInjuryDate,
      estimatedReturnDate: newEstimatedReturnDate,
      status: newStatus as any,
      physioNotes: notesText,
      prescribedCare: newProtocol.trim(),
      doctorCleared: newStatus === 'Guéri / Feu vert',
    };

    if (editingRecord) {
      try {
        const updated = await medicalService.updateMedicalRecord(editingRecord.id, recordPayload);
        setMedicalRecords(prev => prev.map(r => r.id === editingRecord.id ? updated : r));
        setSelectedRecord(updated);
        showToast(`Dossier médical de ${updated.playerName} mis à jour !`);
      } catch (err) {
        const updatedLocal = { ...editingRecord, ...recordPayload } as MedicalRecord;
        setMedicalRecords(prev => prev.map(r => r.id === editingRecord.id ? updatedLocal : r));
        setSelectedRecord(updatedLocal);
        showToast(`Dossier médical mis à jour !`);
      }
    } else {
      try {
        const createdRecord = await medicalService.createMedicalRecord(recordPayload, 1);
        setMedicalRecords(prev => [createdRecord, ...prev]);
        setSelectedRecord(createdRecord);
        showToast(`Dossier médical créé pour ${createdRecord.playerName} (${createdRecord.injuryType}) !`);
      } catch (err) {
        const fallbackRecord: MedicalRecord = {
          id: `med-${Date.now()}`,
          ...recordPayload,
        } as MedicalRecord;
        setMedicalRecords(prev => [fallbackRecord, ...prev]);
        setSelectedRecord(fallbackRecord);
        showToast(`Dossier médical créé pour ${fallbackRecord.playerName} !`);
      }
    }

    setIsNewInjuryModalOpen(false);
    setEditingRecord(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Pôle Médical & Blessures</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Registre des blessures, suivi kinésithérapie, protocoles de retour au jeu et certificats médicaux
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          Déclarer une Blessure / Soin
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Indisponibles Actuels</span>
          <div className="text-2xl font-bold text-rose-600 mt-1">
            {medicalRecords.filter(r => r.status === 'Indisponible').length}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Arrêt complet / soins intensifs</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">En Réathlétisation</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {medicalRecords.filter(r => r.status === 'Réathlétisation').length}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Reprise progressive adaptée</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Aptes & Rétablis</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {medicalRecords.filter(r => r.status === 'Guéri / Feu vert' || r.status === 'Apte avec réserve').length}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Feu vert médical accordé</p>
        </div>
      </div>

      {/* Main Grid: Injury records + detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Injury list */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Dossiers Médicaux Récents</h3>
            </div>

            <div className="divide-y divide-slate-100">
              {medicalRecords.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-medium">
                  Aucun dossier médical ou soin enregistré pour le moment.
                </div>
              ) : (
                medicalRecords.map(record => {
                  const isSelected = selectedRecord?.id === record.id;
                  const memberObj = members.find(m => String(m.id) === String(record.playerId));
                  const displayTeamName = memberObj?.teamName && memberObj.teamName !== 'Sans équipe'
                    ? memberObj.teamName
                    : (record.teamName && record.teamName !== 'Équipe 1' ? record.teamName : 'Sans équipe');

                  return (
                    <div
                      key={record.id}
                      onClick={() => setSelectedRecord(record)}
                      className={`p-4 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected ? 'bg-rose-50/70 border-l-4 border-rose-600' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                          <HeartPulse className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900">{record.playerName}</h4>
                            <span className="text-xs text-slate-400">({displayTeamName})</span>
                          </div>
                          <p className="text-xs font-semibold text-rose-700 mt-0.5">{record.injuryType}</p>
                          <p className="text-[11px] text-slate-400">
                            Date blessure : {record.injuryDate} {record.estimatedReturnDate ? `• Retour estimé : ${record.estimatedReturnDate}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            record.status === 'Indisponible'
                              ? 'bg-rose-100 text-rose-800'
                              : record.status === 'Réathlétisation'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {record.status}
                        </span>

                        {/* Edit & Delete Action Icons */}
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            type="button"
                            onClick={(e) => openEditModal(record, e)}
                            title="Modifier le dossier médical"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteInjury(record.id, e)}
                            title="Supprimer le dossier médical"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Selected Injury Record Details */}
        <div>
          {selectedRecord ? (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6 sticky top-24">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-rose-600 tracking-wider">Fiche de Soins</span>
                  <h3 className="font-bold text-lg text-slate-900 mt-1">{selectedRecord.playerName}</h3>
                  <p className="text-xs text-slate-500">{selectedTeamName}</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => openEditModal(selectedRecord, e)}
                    title="Modifier"
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteInjury(selectedRecord.id, e)}
                    title="Supprimer"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nature du traumatisme :</span>
                  <span className="font-bold text-rose-700">{selectedRecord.injuryType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date de survenue :</span>
                  <span className="font-semibold text-slate-800">{selectedRecord.injuryDate}</span>
                </div>
                {selectedRecord.estimatedReturnDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date estimée de reprise :</span>
                    <span className="font-bold text-slate-900">{selectedRecord.estimatedReturnDate}</span>
                  </div>
                )}
              </div>

              {/* Protocol */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                <h4 className="text-xs font-bold uppercase text-blue-900 tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-600" />
                  Protocole & Recommandations Kiné
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedRecord.physioNotes || selectedRecord.prescribedCare || 'Aucun protocole saisi.'}
                </p>
              </div>

              {/* Status change actions */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-700">Changer l'état du joueur :</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedRecord.id, 'Indisponible')}
                    className="p-2 text-xs font-bold rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer transition-colors"
                  >
                    Indisponible
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedRecord.id, 'Réathlétisation')}
                    className="p-2 text-xs font-bold rounded-xl bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 cursor-pointer transition-colors"
                  >
                    Réathlétisation
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedRecord.id, 'Guéri / Feu vert')}
                    className="p-2 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer transition-colors"
                  >
                    Feu Vert (Apte)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-400">
              Sélectionnez un dossier médical pour afficher le protocole de soins.
            </div>
          )}
        </div>
      </div>

      {/* New / Edit Medical Injury Record Modal */}
      {isNewInjuryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 font-display">
                    {editingRecord ? 'Modifier le Dossier Médical' : 'Déclaration de Blessure / Soin'}
                  </h3>
                  <p className="text-xs text-slate-500">Ouverture d'un dossier médical et protocole de réathlétisation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsNewInjuryModalOpen(false);
                  setEditingRecord(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInjury} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Licencié / Athlète Concerné *
                  </label>
                  <select
                    value={newMemberId}
                    onChange={e => setNewMemberId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.firstName} {m.lastName} ({m.category} - {m.teamName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Diagnostic / Type de Traumatisme *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Entorse cheville droite stade 2, Déchirure ischio..."
                    value={newInjuryType}
                    onChange={e => setNewInjuryType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date de la Blessure
                  </label>
                  <input
                    type="date"
                    value={newInjuryDate}
                    onChange={e => setNewInjuryDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Retour Estimé au Jeu
                  </label>
                  <input
                    type="date"
                    value={newEstimatedReturnDate}
                    onChange={e => setNewEstimatedReturnDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Statut Initial
                  </label>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    <option value="Indisponible">Indisponible (Arrêt complet)</option>
                    <option value="Réathlétisation">En Réathlétisation</option>
                    <option value="Apte avec réserve">Apte avec réserve</option>
                    <option value="Guéri / Feu vert">Guéri / Feu vert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Praticien Référent / Médecin / Kiné
                </label>
                <input
                  type="text"
                  placeholder="Ex: Dr. Thomas Clairet / Kiné Sportif Maxime"
                  value={newPractitioner}
                  onChange={e => setNewPractitioner(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Protocole de Soins & Consignes Médicales
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Séances de physiothérapie, glaçage, renforcement excentrique..."
                  value={newProtocol}
                  onChange={e => setNewProtocol(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewInjuryModalOpen(false);
                    setEditingRecord(null);
                  }}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  {editingRecord ? 'Mettre à jour le Dossier' : 'Enregistrer le Dossier Médical'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
