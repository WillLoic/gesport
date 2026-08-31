import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Download,
  Mail,
  CheckCircle,
  Clock,
  AlertTriangle,
  Send,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { Invoice } from '../../types';

export const InvoicingView: React.FC = () => {
  const { invoices, setInvoices, showToast } = useClub();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(invoices[0] || null);
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);

  // New Invoice Form State
  const [newClientName, setNewClientName] = useState('');
  const [newType, setNewType] = useState('Sponsoring Officiel Maillot');
  const [newEmail, setNewEmail] = useState('');
  const [newAmountHT, setNewAmountHT] = useState(2500);
  const [newIssueDate, setNewIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDueDate, setNewDueDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [newStatus, setNewStatus] = useState<'En attente' | 'Payée'>('En attente');

  const calculatedTTC = Math.round(Number(newAmountHT) * 1.2 * 100) / 100;

  const handleSendReminder = (invoiceId: string, clientName: string) => {
    showToast(`Email de relance automatique avec RIB officiel transmis à ${clientName} !`);
  };

  const handleMarkPaid = (invoiceId: string) => {
    setInvoices(prev =>
      prev.map(inv => (inv.id === invoiceId ? { ...inv, status: 'Payée' } : inv))
    );
    if (selectedInvoice && selectedInvoice.id === invoiceId) {
      setSelectedInvoice(prev => (prev ? { ...prev, status: 'Payée' } : null));
    }
    showToast('Facture marquée comme réglée et enregistrée en comptabilité !');
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) {
      showToast('Veuillez renseigner le nom du client ou partenaire.');
      return;
    }

    const nextNumber = `FAC-2025-${String(invoices.length + 1).padStart(3, '0')}`;
    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      number: nextNumber,
      clientName: newClientName.trim(),
      type: newType as any,
      issueDate: newIssueDate,
      dueDate: newDueDate,
      amountHT: Number(newAmountHT) || 0,
      amountTTC: calculatedTTC,
      status: newStatus as any,
      recipientEmail: newEmail.trim() || `contact@${newClientName.toLowerCase().replace(/[^a-z0-9]/g, '')}.fr`,
    };

    setInvoices(prev => [newInv, ...prev]);
    setSelectedInvoice(newInv);
    setIsNewInvoiceModalOpen(false);
    showToast(`Facture ${newInv.number} (${newInv.amountTTC.toLocaleString('fr-FR')} € TTC) créée pour ${newInv.clientName} !`);

    // Reset
    setNewClientName('');
    setNewEmail('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Facturation & Devis Sponsors</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Émission des factures de partenariats, conventions municipales, relances d'impayés et export PDF
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewInvoiceModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          Créer une Facture
        </button>
      </div>

      {/* Main Grid: Invoices Table + Detail PDF preview box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoices List Table (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">N° Facture</th>
                    <th className="py-3 px-4">Client / Partenaire</th>
                    <th className="py-3 px-4">Émission</th>
                    <th className="py-3 px-4">Échéance</th>
                    <th className="py-3 px-4 text-right">Montant TTC</th>
                    <th className="py-3 px-4 text-center">Statut</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {invoices.map(inv => {
                    const isSelected = selectedInvoice?.id === inv.id;
                    return (
                      <tr
                        key={inv.id}
                        onClick={() => setSelectedInvoice(inv)}
                        className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/60 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-mono text-blue-600 font-bold">{inv.number}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{inv.clientName}</div>
                          <div className="text-xs text-slate-500">{inv.type}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{inv.issueDate}</td>
                        <td className="py-3 px-4 text-slate-600">{inv.dueDate}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 text-base">
                          {inv.amountTTC.toLocaleString('fr-FR')} €
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              inv.status === 'Payée'
                                ? 'bg-emerald-100 text-emerald-800'
                                : inv.status === 'En retard'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {inv.status === 'Payée' && <CheckCircle className="w-3 h-3" />}
                            {inv.status === 'En retard' && <AlertTriangle className="w-3 h-3" />}
                            {inv.status === 'En attente' && <Clock className="w-3 h-3" />}
                            <span>{inv.status}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {inv.status === 'En retard' && (
                              <button
                                type="button"
                                onClick={() => handleSendReminder(inv.id, inv.clientName)}
                                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
                                title="Envoyer une relance par email"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => showToast(`Facture ${inv.number} téléchargée en PDF.`)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 cursor-pointer"
                              title="Télécharger PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Selected Invoice Full Detail Sheet */}
        <div>
          {selectedInvoice ? (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6 sticky top-24">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-600">{selectedInvoice.number}</span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      selectedInvoice.status === 'Payée'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedInvoice.status === 'En retard'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedInvoice.status}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 mt-2">{selectedInvoice.clientName}</h3>
                <p className="text-xs text-slate-500">{selectedInvoice.type}</p>
                <p className="text-xs text-slate-400 mt-1">Contact: {selectedInvoice.recipientEmail}</p>
              </div>

              {/* Total Calculation */}
              <div className="p-3 rounded-xl bg-slate-100 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Total HT :</span>
                  <span>{selectedInvoice.amountHT.toLocaleString('fr-FR')} €</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>TVA (20%) :</span>
                  <span>{(selectedInvoice.amountTTC - selectedInvoice.amountHT).toLocaleString('fr-FR')} €</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total TTC :</span>
                  <span>{selectedInvoice.amountTTC.toLocaleString('fr-FR')} €</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                {selectedInvoice.status !== 'Payée' && (
                  <button
                    type="button"
                    onClick={() => handleMarkPaid(selectedInvoice.id)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    Encaisser & Marquer Payée
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => showToast(`Facture officielle ${selectedInvoice.number} générée avec signature.`)}
                  className="w-full py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  Télécharger Facture PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-400">
              Sélectionnez une facture pour afficher le récapitulatif.
            </div>
          )}
        </div>
      </div>

      {/* New Invoice Modal */}
      {isNewInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 font-display">Émettre une Facture</h3>
                  <p className="text-xs text-slate-500">Facturation sponsor, subvention ou prestation club</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewInvoiceModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Client / Entreprise Sponsor / Collectivité *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Groupe Casino, Intersport Sud, Mairie de Marseille..."
                  value={newClientName}
                  onChange={e => setNewClientName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Prestation / Objet
                  </label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    <option value="Sponsoring Officiel Maillot">Sponsoring Maillot Pro</option>
                    <option value="Panneau d'Affichage Gymnase">Panneau Visibilité Gymnase</option>
                    <option value="Naming Événement / Tournoi">Naming Tournoi / Stage</option>
                    <option value="Subvention Municipale">Subvention Municipale</option>
                    <option value="Prestation Entraînement / Stage">Prestation Stage Extérieur</option>
                    <option value="Mécénat d'Entreprise">Mécénat / Don Entreprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email de Facturation
                  </label>
                  <input
                    type="email"
                    placeholder="compta@partenaire.com"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Montant HT (€) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newAmountHT}
                    onChange={e => setNewAmountHT(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-bold text-slate-900 outline-hidden"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    TTC (avec 20% TVA) : <strong>{calculatedTTC.toLocaleString('fr-FR')} €</strong>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Statut de Règlement
                  </label>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    <option value="En attente">En attente de paiement (30 jours)</option>
                    <option value="Payée">Déjà réglée / Encaissée</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date d'Émission
                  </label>
                  <input
                    type="date"
                    value={newIssueDate}
                    onChange={e => setNewIssueDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date d'Échéance
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={e => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors"
                >
                  Générer la Facture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
