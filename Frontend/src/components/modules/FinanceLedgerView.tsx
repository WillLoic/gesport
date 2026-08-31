import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
  Clock,
  Download,
  X,
  CreditCard,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { FinancialTransaction } from '../../types';

export const FinanceLedgerView: React.FC = () => {
  const { finances, setFinances, showToast } = useClub();
  const [selectedType, setSelectedType] = useState<'all' | 'Recette' | 'Dépense'>('all');
  const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState(false);

  // New Transaction Form State
  const [entryType, setEntryType] = useState<'Recette' | 'Dépense'>('Recette');
  const [entryLabel, setEntryLabel] = useState('');
  const [entryAmount, setEntryAmount] = useState(350);
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryCategory, setEntryCategory] = useState('Cotisations');
  const [entryPaymentMethod, setEntryPaymentMethod] = useState('Virement bancaire');
  const [entryRef, setEntryRef] = useState('');
  const [entryStatus, setEntryStatus] = useState<'Rapproché' | 'En attente'>('Rapproché');

  const totalIncome = finances
    .filter(f => f.type === 'Recette')
    .reduce((acc, f) => acc + f.amount, 0);

  const totalExpense = finances
    .filter(f => f.type === 'Dépense')
    .reduce((acc, f) => acc + f.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const filteredFinances = finances.filter(f =>
    selectedType === 'all' ? true : f.type === selectedType
  );

  const handleToggleReconciled = (entryId: string) => {
    setFinances(prev =>
      prev.map(f =>
        f.id === entryId
          ? { ...f, status: f.status === 'Rapproché' ? 'En attente' : 'Rapproché' }
          : f
      )
    );
    showToast('Rapprochement bancaire actualisé !');
  };

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryLabel.trim() || !entryAmount) {
      showToast('Veuillez renseigner le libellé et le montant.');
      return;
    }

    const newTx: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      date: entryDate,
      label: entryLabel.trim(),
      category: entryCategory,
      type: entryType,
      amount: Math.abs(Number(entryAmount)),
      paymentMethod: entryPaymentMethod,
      invoiceReference: entryRef.trim() || undefined,
      status: entryStatus,
    };

    setFinances(prev => [newTx, ...prev]);
    setIsNewEntryModalOpen(false);
    showToast(`Écriture comptable "${newTx.label}" enregistrée (${newTx.type === 'Recette' ? '+' : '-'}${newTx.amount} €) !`);

    // Reset Form
    setEntryLabel('');
    setEntryRef('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Grand Livre & Trésorerie</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Comptabilité générale, recettes de cotisations, subventions municipales, dépenses et rapprochement bancaire
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewEntryModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Écriture
        </button>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Recettes Réalisées</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-display">
            +{totalIncome.toLocaleString('fr-FR')} €
          </div>
          <p className="text-xs text-slate-500">Cotisations, sponsors, buvette</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Dépenses Engagées</span>
            <ArrowDownLeft className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 font-display">
            -{totalExpense.toLocaleString('fr-FR')} €
          </div>
          <p className="text-xs text-slate-500">Salaires, déplacements, matériel</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Solde Net Trésorerie</span>
            <Receipt className="w-4 h-4 text-blue-600" />
          </div>
          <div className={`text-2xl sm:text-3xl font-black font-display ${netBalance >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
            {netBalance >= 0 ? '+' : ''}{netBalance.toLocaleString('fr-FR')} €
          </div>
          <p className="text-xs text-slate-500">Excédent d'exploitation actuel</p>
        </div>
      </div>

      {/* Transactions Table with Filter Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedType === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Toutes les lignes
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('Recette')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedType === 'Recette' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Recettes
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('Dépense')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedType === 'Dépense' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Dépenses
            </button>
          </div>

          <button
            type="button"
            onClick={() => showToast('Export FEC / Grand Livre comptable au format CSV généré.')}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Exporter Grand Livre (FEC)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Libellé de l'Écriture</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Mode de Paiement</th>
                <th className="py-3 px-4 text-right">Montant</th>
                <th className="py-3 px-4 text-center">Rapprochement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredFinances.map(entry => (
                <tr key={entry.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-500">{entry.date}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{entry.label}</div>
                    {entry.invoiceReference && (
                      <span className="text-[10px] font-mono text-blue-600">Réf: {entry.invoiceReference}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{entry.category}</td>
                  <td className="py-3 px-4 text-slate-600">{entry.paymentMethod}</td>
                  <td
                    className={`py-3 px-4 text-right font-black text-base ${
                      entry.type === 'Recette' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {entry.type === 'Recette' ? '+' : '-'}
                    {entry.amount.toLocaleString('fr-FR')} €
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleReconciled(entry.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold cursor-pointer ${
                        entry.status === 'Rapproché'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      }`}
                    >
                      {entry.status === 'Rapproché' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      <span>{entry.status}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Transaction Modal */}
      {isNewEntryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 font-display">Nouvelle Écriture Comptable</h3>
                  <p className="text-xs text-slate-500">Saisie d'une recette ou dépense au Grand Livre</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewEntryModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setEntryType('Recette');
                    setEntryCategory('Cotisations');
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    entryType === 'Recette'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  + Recette (Encaissement)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEntryType('Dépense');
                    setEntryCategory('Matériel & Équipement');
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    entryType === 'Dépense'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  - Dépense (Décaissement)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Libellé de l'Opération *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Subvention Mairie Aix-en-Provence 2025, Achat trousse secours..."
                  value={entryLabel}
                  onChange={e => setEntryLabel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Montant (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0.01}
                    required
                    value={entryAmount}
                    onChange={e => setEntryAmount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-bold text-slate-900 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date Valeur
                  </label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={e => setEntryDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Catégorie Comptable
                  </label>
                  <select
                    value={entryCategory}
                    onChange={e => setEntryCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    {entryType === 'Recette' ? (
                      <>
                        <option value="Cotisations & Licences">Cotisations & Licences</option>
                        <option value="Subventions publiques">Subventions publiques</option>
                        <option value="Sponsoring & Partenariats">Sponsoring & Partenariats</option>
                        <option value="Billetterie & Matchs">Billetterie & Matchs</option>
                        <option value="Boutique & Buvette">Boutique & Buvette</option>
                        <option value="Stages & Tournois">Stages & Tournois</option>
                      </>
                    ) : (
                      <>
                        <option value="Matériel & Équipement">Matériel & Équipement</option>
                        <option value="Déplacements & Carburant">Déplacements & Carburant</option>
                        <option value="Salaires & Indemnités">Salaires & Indemnités</option>
                        <option value="Arbitrage & Frais FFVB">Arbitrage & Frais FFVB</option>
                        <option value="Assurances & Affiliations">Assurances & Affiliations</option>
                        <option value="Pharmacie & Soins">Pharmacie & Soins</option>
                        <option value="Communication & Événements">Communication & Événements</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mode de Règlement
                  </label>
                  <select
                    value={entryPaymentMethod}
                    onChange={e => setEntryPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    <option value="Virement bancaire">Virement bancaire</option>
                    <option value="Carte bancaire">Carte bancaire (TPE)</option>
                    <option value="Prélèvement SEPA">Prélèvement SEPA</option>
                    <option value="Chèque">Chèque</option>
                    <option value="Espèces">Espèces</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Référence Facture / Justificatif
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: FAC-2025-089"
                    value={entryRef}
                    onChange={e => setEntryRef(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-mono text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Statut Rapprochement
                  </label>
                  <select
                    value={entryStatus}
                    onChange={e => setEntryStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    <option value="Rapproché">Rapproché (Relevé bancaire validé)</option>
                    <option value="En attente">En attente de débit/crédit</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewEntryModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors"
                >
                  Enregistrer l'Écriture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
