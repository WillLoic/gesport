import React, { useState } from 'react';
import {
  WalletCards,
  Plus,
  CheckCircle,
  Clock,
  Download,
  X,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { ExpenseClaim } from '../../types';

export const ExpenseClaimsView: React.FC = () => {
  const { expenses, setExpenses, showToast } = useClub();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [claimantName, setClaimantName] = useState('');
  const [claimantRole, setClaimantRole] = useState('Entraîneur');
  const [category, setCategory] = useState('Indemnités Kilométriques (IK)');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>(45);
  const [distanceKm, setDistanceKm] = useState<number | ''>(100);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleApproveExpense = (expenseId: string) => {
    setExpenses(prev =>
      prev.map(e => (e.id === expenseId ? { ...e, status: 'Validé pour paiement' } : e))
    );
    showToast('Note de frais validée pour ordre de virement trésorerie !');
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimantName.trim() || !amount) {
      showToast('Veuillez renseigner le bénéficiaire et le montant.');
      return;
    }

    const newClaim: ExpenseClaim = {
      id: `exp-${Date.now()}`,
      claimantName: claimantName.trim(),
      claimantRole: claimantRole.trim(),
      category: category.includes('IK') || category.includes('Kilo')
        ? 'Kilomètres déplacement match'
        : category.includes('Repas')
        ? 'Repas équipe'
        : category.includes('Péage')
        ? 'Péages & Stationnement'
        : 'Achat d’urgence matériel',
      date,
      description: description.trim() || 'Frais de déplacement officiel match',
      amount: Number(amount),
      distanceKm: distanceKm ? Number(distanceKm) : undefined,
      status: 'En attente trésorier',
      receiptAttached: true,
    };

    setExpenses(prev => [newClaim, ...prev]);
    setIsModalOpen(false);
    showToast(`Note de frais de ${newClaim.amount} € soumise au trésorier.`);
    setClaimantName('');
    setDescription('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Notes de Frais & Indemnités Kilométriques</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Remboursements des déplacements des entraîneurs, repas d'équipes et justificatifs de frais de transport
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Déclarer des Frais
        </button>
      </div>

      {/* Expense Claims Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Bénéficiaire</th>
                <th className="py-3 px-4">Catégorie de Frais</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description & Distance</th>
                <th className="py-3 px-4 text-right">Montant</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {expenses.map(claim => (
                <tr key={claim.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{claim.claimantName}</div>
                    <div className="text-xs text-slate-500">{claim.claimantRole}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{claim.category}</td>
                  <td className="py-3 px-4 text-slate-600">{claim.date}</td>
                  <td className="py-3 px-4 text-slate-600">
                    <div>{claim.description}</div>
                    {claim.distanceKm && (
                      <span className="text-[11px] text-blue-600 font-semibold">{claim.distanceKm} km parcourus</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 text-base">
                    {claim.amount.toLocaleString('fr-FR')} €
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        claim.status === 'Validé pour paiement' || claim.status === 'Remboursé'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {claim.status === 'En attente trésorier' ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                      <span>{claim.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {claim.status === 'En attente trésorier' ? (
                      <button
                        type="button"
                        onClick={() => handleApproveExpense(claim.id)}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
                      >
                        Valider Remboursement
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => showToast(`Justificatif de frais de ${claim.claimantName} téléchargé.`)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 cursor-pointer"
                        title="Télécharger justificatif"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Déclarer des Frais */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-base text-slate-900">Déclarer une Note de Frais</h3>
                <p className="text-xs text-slate-500">Remboursement de frais engagés pour le club (IK, repas, matériel)</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nom du Demandeur *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Thomas Giraud"
                    value={claimantName}
                    onChange={e => setClaimantName(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rôle au sein du Club</label>
                  <input
                    type="text"
                    value={claimantRole}
                    onChange={e => setClaimantRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type de Dépense</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 outline-hidden"
                  >
                    <option value="Indemnités Kilométriques (IK)">Indemnités Kilométriques (IK)</option>
                    <option value="Péages & Stationnement">Péages & Stationnement</option>
                    <option value="Restauration Déplacement Équipe">Restauration Déplacement Équipe</option>
                    <option value="Matériel & Pharmacie d'Urgence">Matériel & Pharmacie d'Urgence</option>
                    <option value="Hébergement Tournoi">Hébergement Tournoi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date engagée</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Montant Réclamé (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Distance (km si IK)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ex: 120"
                    value={distanceKm}
                    onChange={e => setDistanceKm(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Justification / Détail du Trajet</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Déplacement Match extérieur à Toulon avec 4 joueurs U18"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                />
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
                  Soumettre la Demande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
