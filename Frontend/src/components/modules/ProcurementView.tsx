import React, { useState } from 'react';
import {
  Plus,
  CheckCircle,
  Clock,
  Download,
  ShoppingCart,
  X,
  FileText,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { PurchaseOrder } from '../../types';

export const ProcurementView: React.FC = () => {
  const { purchaseOrders, setPurchaseOrders, staff, showToast } = useClub();
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  // New Order Form State
  const [newSupplier, setNewSupplier] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newRequestedBy, setNewRequestedBy] = useState(staff[0]?.name || 'Responsable Matériel');
  const [newAmountTTC, setNewAmountTTC] = useState(450);
  const [newRequestDate, setNewRequestDate] = useState(new Date().toISOString().split('T')[0]);
  const [newInitialStatus, setNewInitialStatus] = useState<'En attente validation' | 'Validé'>('En attente validation');

  const handleValidateOrder = (orderId: string) => {
    setPurchaseOrders(prev =>
      prev.map(p => (p.id === orderId ? { ...p, status: 'Validé' } : p))
    );
    showToast('Bon de commande validé avec succès par la Trésorerie !');
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.trim() || !newDescription.trim()) {
      showToast('Veuillez renseigner le fournisseur et l\'objet de la commande.');
      return;
    }

    const orderCount = purchaseOrders.length + 1;
    const newOrder: PurchaseOrder = {
      id: `po-${Date.now()}`,
      code: `BC-2025-${String(orderCount).padStart(3, '0')}`,
      supplierName: newSupplier.trim(),
      category: 'Matériel Sportif',
      description: newDescription.trim(),
      requestedBy: newRequestedBy.trim(),
      requestDate: newRequestDate,
      totalAmountTTC: Number(newAmountTTC) || 0,
      status: newInitialStatus as any,
      invoiceAttached: false,
    };

    setPurchaseOrders(prev => [newOrder, ...prev]);
    setIsNewOrderModalOpen(false);
    showToast(`Bon de commande ${newOrder.code} créé avec succès !`);

    // Reset Form
    setNewSupplier('');
    setNewDescription('');
    setNewAmountTTC(200);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Achats & Bons de Commande</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Commandes d'équipements sportifs, fournitures club, devis fournisseurs et circuit de validation
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewOrderModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          Nouveau Bon de Commande
        </button>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">N° Commande</th>
                <th className="py-3 px-4">Fournisseur & Objet</th>
                <th className="py-3 px-4">Demandeur</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Montant TTC</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {purchaseOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">{order.code}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{order.supplierName}</div>
                    <div className="text-xs text-slate-500">{order.description}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{order.requestedBy}</td>
                  <td className="py-3 px-4 text-slate-600">{order.requestDate}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 text-base">
                    {order.totalAmountTTC.toLocaleString('fr-FR')} €
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        order.status === 'Validé' || order.status === 'Livré'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status === 'En attente validation' ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                      <span>{order.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {order.status === 'En attente validation' ? (
                      <button
                        type="button"
                        onClick={() => handleValidateOrder(order.id)}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
                      >
                        Valider Achat
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => showToast(`Bon de commande ${order.code} téléchargé en PDF.`)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 cursor-pointer"
                        title="Télécharger le bon de commande"
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

      {/* New Purchase Order Modal */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 font-display">Nouveau Bon de Commande</h3>
                  <p className="text-xs text-slate-500">Demande d'achat et engagement de dépenses club</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewOrderModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Fournisseur / Prestataire *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Decathlon Pro, Mikasa Sports, Pharmacie Centrale..."
                    value={newSupplier}
                    onChange={e => setNewSupplier(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Demandeur / Responsable
                  </label>
                  <input
                    type="text"
                    value={newRequestedBy}
                    onChange={e => setNewRequestedBy(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Objet de la Commande / Désignation *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ex: Réassort 20 ballons de match officielle + 10 trousses de cryothérapie"
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Montant Estimé TTC (€) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newAmountTTC}
                    onChange={e => setNewAmountTTC(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date de la Demande
                  </label>
                  <input
                    type="date"
                    value={newRequestDate}
                    onChange={e => setNewRequestDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Circuit
                  </label>
                  <select
                    value={newInitialStatus}
                    onChange={e => setNewInitialStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    <option value="En attente validation">En attente Trésorerie</option>
                    <option value="Validé">Pré-validé d'office</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors"
                >
                  Créer le Bon de Commande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
