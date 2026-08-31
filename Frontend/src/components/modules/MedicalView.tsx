import React, { useState } from 'react';
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
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { MedicalRecord } from '../../types';

export const MedicalView: React.FC = () => {
  const { medicalRecords, setMedicalRecords, members, teams, showToast } = useClub();
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(medicalRecords[0] || null);
  const [isNewInjuryModalOpen, setIsNewInjuryModalOpen] = useState(false);

  // New Injury Form State
  const [newMemberId, setNewMemberId] = useState(members[0]?.id || 'm1');
  const [newInjuryType, setNewInjuryType] = useState('Entorse cheville droite (Stade 2)');
  const [newInjuryDate, setNewInjuryDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEstimatedReturnDate, setNewEstimatedReturnDate] = useState(
    new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [newStatus, setNewStatus] = useState<'Indisponible' | 'Réathlétisation' | 'Apte avec réserve'>('Indisponible');
  const [newPractitioner, setNewPractitioner] = useState('Dr. Thomas Clairet (Médecin du Club)');
  const [newProtocol, setNewProtocol] = useState('Protocole RICE immédiat (Repos, Glaçage, Compression, Élévation), 10 séances de kiné proprioception et reprise progressive sur terrain.');

  const handleUpdateStatus = (recordId: string, status: any) => {
    setMedicalRecords(prev =>
      prev.map(r => (r.id === recordId ? { ...r, status } : r))
    );
    if (selectedRecord && selectedRecord.id === recordId) {
      setSelectedRecord(prev => (prev ? { ...prev, status } : null));
    }
    showToast(`Statut médical mis à jour : ${status}`);
  };

  const handleCreateInjury = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMember = members.find(m => m.id === newMemberId) || members[0];
    const targetTeam = teams.find(t => t.id === targetMember?.teamId) || teams[0];

    const newRecord: MedicalRecord = {
      id: `med-${Date.now()}`,
      playerId: targetMember ? targetMember.id : 'm1',
      playerName: targetMember ? `${targetMember.firstName} ${targetMember.lastName}` : 'Licencié',
      teamName: targetTeam ? targetTeam.name : 'Équipe 1',
      injuryType: newInjuryType.trim() || 'Lésion musculaire',
      bodyPart: 'Membre inférieur',
      severity: 'Modérée (1-4 sem)',
      injuryDate: newInjuryDate,
      estimatedReturnDate: newEstimatedReturnDate,
      status: newStatus as any,
      physioNotes: `${newProtocol.trim()} — Suivi par : ${newPractitioner.trim()}`,
      prescribedCare: newProtocol.trim() || 'Repos et soins kiné',
      doctorCleared: false,
    };

    setMedicalRecords(prev => [newRecord, ...prev]);
    setSelectedRecord(newRecord);
    setIsNewInjuryModalOpen(false);
    showToast(`Dossier médical créé pour ${newRecord.playerName} (${newRecord.injuryType}) !`);

    // Reset Form
    setNewInjuryType('Entorse cheville');
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
          onClick={() => setIsNewInjuryModalOpen(true)}
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
              {medicalRecords.map(record => {
                const isSelected = selectedRecord?.id === record.id;
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
                          <span className="text-xs text-slate-400">({record.teamName})</span>
                        </div>
                        <p className="text-xs font-semibold text-rose-700 mt-0.5">{record.injuryType}</p>
                        <p className="text-[11px] text-slate-400">
                          Date blessure : {record.injuryDate} • Retour estimé : {record.estimatedReturnDate}
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
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Selected Injury Record Details */}
        <div>
          {selectedRecord ? (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6 sticky top-24">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-bold uppercase text-rose-600 tracking-wider">Fiche de Soins</span>
                <h3 className="font-bold text-lg text-slate-900 mt-1">{selectedRecord.playerName}</h3>
                <p className="text-xs text-slate-500">{selectedRecord.teamName}</p>
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
                <div className="flex justify-between">
                  <span className="text-slate-500">Date estimée de reprise :</span>
                  <span className="font-bold text-slate-900">{selectedRecord.estimatedReturnDate}</span>
                </div>
              </div>

              {/* Protocol */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                <h4 className="text-xs font-bold uppercase text-blue-900 tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-600" />
                  Protocole & Recommandations Kiné
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">{selectedRecord.protocol}</p>
              </div>

              {/* Status change actions */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-700">Changer l'état du joueur :</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedRecord.id, 'Indisponible')}
                    className="p-2 text-xs font-bold rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                  >
                    Indisponible
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedRecord.id, 'Réathlétisation')}
                    className="p-2 text-xs font-bold rounded-xl bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                  >
                    Réathlétisation
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedRecord.id, 'Apte')}
                    className="p-2 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
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

      {/* New Medical Injury Record Modal */}
      {isNewInjuryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 font-display">Déclaration de Blessure / Soin</h3>
                  <p className="text-xs text-slate-500">Ouverture d'un dossier médical et protocole de réathlétisation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewInjuryModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInjury} className="space-y-4">
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
                  placeholder="Séances de physiothérapie, glaçage, renforcement excentrique..."
                  value={newProtocol}
                  onChange={e => setNewProtocol(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewInjuryModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-colors"
                >
                  Enregistrer le Dossier Médical
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
