import React from 'react';
import {
  X,
  AlertTriangle,
  HeartPulse,
  Receipt,
  Boxes,
  Users,
  CheckCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useClub, ActiveModule } from '../../context/ClubContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { members, medicalRecords, invoices, inventory, purchaseOrders, setActiveModule, showToast } = useClub();

  if (!isOpen) return null;

  // Compute urgent alerts
  const expiredMembers = members.filter(m => !m.medicalCertValid || m.licenseStatus === 'Expirée');
  const injuredPlayers = medicalRecords.filter(m => m.status === 'Indisponible' || m.status === 'Réathlétisation');
  const overdueInvoices = invoices.filter(i => i.status === 'En retard');
  const lowStockItems = inventory.filter(i => i.quantityAvailable <= i.minThresholdAlert);
  const pendingOrders = purchaseOrders.filter(p => p.status === 'En attente validation');

  const handleNavigate = (module: ActiveModule) => {
    setActiveModule(module);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/50 backdrop-blur-xs">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Centre d'Alertes & Notifications</h3>
                <p className="text-xs text-slate-500">Rappels opérationnels du club</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Alert list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Medical / Injuries */}
            {injuredPlayers.length > 0 && (
              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                    <HeartPulse className="w-4 h-4 text-rose-600" />
                    Pôle Médical ({injuredPlayers.length} indisponible{injuredPlayers.length > 1 ? 's' : ''})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleNavigate('medical')}
                    className="text-[11px] font-semibold text-rose-700 hover:underline flex items-center gap-0.5"
                  >
                    Voir <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  {injuredPlayers.map(p => (
                    <div key={p.id} className="text-xs text-slate-700 bg-white p-2 rounded-lg border border-rose-100">
                      <p className="font-semibold text-slate-900">{p.playerName} ({p.teamName})</p>
                      <p className="text-slate-500">{p.injuryType} — Reprise est.: {p.estimatedReturnDate}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expired / Pending Medical Licenses */}
            {expiredMembers.length > 0 && (
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                    <Users className="w-4 h-4 text-amber-600" />
                    Licences & Certificats ({expiredMembers.length} à régulariser)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleNavigate('members')}
                    className="text-[11px] font-semibold text-amber-700 hover:underline flex items-center gap-0.5"
                  >
                    Voir <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  {expiredMembers.slice(0, 3).map(m => (
                    <div key={m.id} className="text-xs text-slate-700 bg-white p-2 rounded-lg border border-amber-100 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{m.firstName} {m.lastName}</p>
                        <p className="text-slate-500">{m.teamName}</p>
                      </div>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                        {!m.medicalCertValid ? 'Certificat expiré' : m.licenseStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overdue Invoices */}
            {overdueInvoices.length > 0 && (
              <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-red-800">
                    <Receipt className="w-4 h-4 text-red-600" />
                    Factures en retard ({overdueInvoices.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleNavigate('invoices')}
                    className="text-[11px] font-semibold text-red-700 hover:underline flex items-center gap-0.5"
                  >
                    Relancer <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  {overdueInvoices.map(inv => (
                    <div key={inv.id} className="text-xs text-slate-700 bg-white p-2 rounded-lg border border-red-100 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{inv.clientName}</p>
                        <p className="text-slate-500">Échéance: {inv.dueDate}</p>
                      </div>
                      <span className="font-bold text-red-700">{inv.amountTTC} €</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Low stock alerts */}
            {lowStockItems.length > 0 && (
              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-blue-800">
                    <Boxes className="w-4 h-4 text-blue-600" />
                    Stock sous seuil d'alerte ({lowStockItems.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleNavigate('inventory')}
                    className="text-[11px] font-semibold text-blue-700 hover:underline flex items-center gap-0.5"
                  >
                    Gérer <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  {lowStockItems.map(item => (
                    <div key={item.id} className="text-xs text-slate-700 bg-white p-2 rounded-lg border border-blue-100 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-slate-500">{item.storageLocation}</p>
                      </div>
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        {item.quantityAvailable} restants
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Purchase Orders */}
            {pendingOrders.length > 0 && (
              <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-purple-800">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    Bons de commande à valider ({pendingOrders.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleNavigate('procurement')}
                    className="text-[11px] font-semibold text-purple-700 hover:underline flex items-center gap-0.5"
                  >
                    Valider <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  {pendingOrders.map(po => (
                    <div key={po.id} className="text-xs text-slate-700 bg-white p-2 rounded-lg border border-purple-100 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{po.supplierName}</p>
                        <p className="text-slate-500">{po.description}</p>
                      </div>
                      <span className="font-bold text-purple-800">{po.totalAmountTTC} €</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={() => {
                showToast('Toutes les alertes ont été marquées comme lues.');
                onClose();
              }}
              className="w-full py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl"
            >
              Marquer tout comme lu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
