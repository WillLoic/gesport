import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  AlertTriangle,
  CheckCircle,
  Download,
  X,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { StaffContract } from '../../types';

export const StaffContractsView: React.FC = () => {
  const { contracts, setContracts, showToast } = useClub();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [staffName, setStaffName] = useState('');
  const [role, setRole] = useState('Entraîneur Équipe Première');
  const [contractType, setContractType] = useState('CDD Sportif');
  const [weeklyHours, setWeeklyHours] = useState(20);
  const [monthlySalary, setMonthlySalary] = useState(1850);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('2026-06-30');

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim()) {
      showToast('Veuillez entrer le nom du salarié.');
      return;
    }

    const newContract: StaffContract = {
      id: `c-${Date.now()}`,
      staffName: staffName.trim(),
      role: role.trim(),
      contractType,
      weeklyHours: Number(weeklyHours) || 15,
      monthlyGrossSalary: Number(monthlySalary) || 1500,
      startDate,
      endDate,
      status: 'Actif',
    };

    setContracts(prev => [newContract, ...prev]);
    setIsModalOpen(false);
    showToast(`Contrat de travail pour ${newContract.staffName} enregistré avec succès !`);
    setStaffName('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Contrats RH & Salaires Staff</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Suivi des CDD sportifs, CDI, vacataires, volume horaire hebdomadaire et alertes d'échéance de contrat
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Ajouter un Contrat
        </button>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Salarié / Entraîneur</th>
                <th className="py-3 px-4">Fonction</th>
                <th className="py-3 px-4">Type de Contrat</th>
                <th className="py-3 px-4 text-center">Volume Hebdo</th>
                <th className="py-3 px-4 text-right">Salaire Brut Mensuel</th>
                <th className="py-3 px-4 text-center">Statut & Échéance</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {contracts.map(contract => {
                const isExpiring = contract.status.includes('Renouvellement');
                return (
                  <tr key={contract.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{contract.staffName}</td>
                    <td className="py-3 px-4 text-slate-600">{contract.role}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-xs">
                        {contract.contractType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">{contract.weeklyHours}h / sem</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 text-base">
                      {contract.monthlyGrossSalary.toLocaleString('fr-FR')} €
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isExpiring ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          <AlertTriangle className="w-3 h-3" />
                          Fin dans {contract.alertDaysLeft || 25}j
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3" />
                          {contract.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => showToast(`Fiche de paie et contrat de ${contract.staffName} exportés.`)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 cursor-pointer"
                        title="Télécharger convention"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Ajouter un Contrat */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-base text-slate-900">Enregistrer un Contrat Staff / Salarié</h3>
                <p className="text-xs text-slate-500">Gestion des conventions d'entraînement et rémunérations</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nom et Prénom du Salarié *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Thomas Giraud"
                  value={staffName}
                  onChange={e => setStaffName(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fonction / Rôle</label>
                  <input
                    type="text"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type de Contrat</label>
                  <select
                    value={contractType}
                    onChange={e => setContractType(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 outline-hidden"
                  >
                    <option value="CDD Sportif">CDD Sportif</option>
                    <option value="CDI Temps Plein">CDI Temps Plein</option>
                    <option value="CDI Temps Partiel">CDI Temps Partiel</option>
                    <option value="Vacataire / Prestation">Vacataire / Prestation</option>
                    <option value="Contrat d'Apprentissage">Contrat d'Apprentissage</option>
                    <option value="Service Civique">Service Civique</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Volume Hebdo (heures)</label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={weeklyHours}
                    onChange={e => setWeeklyHours(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Salaire Brut Mensuel (€)</label>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    value={monthlySalary}
                    onChange={e => setMonthlySalary(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date d'embauche</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date de fin prévisionnelle</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Enregistrer le Contrat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
