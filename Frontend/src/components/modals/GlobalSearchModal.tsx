import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Users,
  Calendar,
  Boxes,
  Receipt,
  FileText,
  Truck,
  Dumbbell,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { useClub, ActiveModule } from '../../context/ClubContext';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const { members, events, inventory, invoices, vehicles, exercises, teams, setActiveModule } = useClub();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open triggered from parent or event
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  const filteredMembers = cleanQuery
    ? members.filter(
        m =>
          m.firstName.toLowerCase().includes(cleanQuery) ||
          m.lastName.toLowerCase().includes(cleanQuery) ||
          m.licenseNumber.toLowerCase().includes(cleanQuery) ||
          m.teamName.toLowerCase().includes(cleanQuery)
      )
    : [];

  const filteredEvents = cleanQuery
    ? events.filter(
        e =>
          e.title.toLowerCase().includes(cleanQuery) ||
          (e.opponent && e.opponent.toLowerCase().includes(cleanQuery)) ||
          e.location.toLowerCase().includes(cleanQuery)
      )
    : [];

  const filteredInventory = cleanQuery
    ? inventory.filter(
        i =>
          i.name.toLowerCase().includes(cleanQuery) ||
          i.category.toLowerCase().includes(cleanQuery) ||
          i.qrCode.toLowerCase().includes(cleanQuery)
      )
    : [];

  const filteredInvoices = cleanQuery
    ? invoices.filter(
        inv =>
          inv.number.toLowerCase().includes(cleanQuery) ||
          inv.clientName.toLowerCase().includes(cleanQuery)
      )
    : [];

  const filteredVehicles = cleanQuery
    ? vehicles.filter(
        v =>
          v.name.toLowerCase().includes(cleanQuery) ||
          v.plateNumber.toLowerCase().includes(cleanQuery)
      )
    : [];

  const handleNavigate = (module: ActiveModule) => {
    setActiveModule(module);
    onClose();
  };

  const hasResults =
    filteredMembers.length > 0 ||
    filteredEvents.length > 0 ||
    filteredInventory.length > 0 ||
    filteredInvoices.length > 0 ||
    filteredVehicles.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 gap-3 bg-slate-50/70">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            placeholder="Rechercher un joueur, une licence, un match, du matériel, une facture..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full text-sm sm:text-base bg-transparent border-none outline-hidden text-slate-900 placeholder:text-slate-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold px-2 py-1 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
          >
            Échap
          </button>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {!query ? (
            <div className="space-y-3 py-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Accès rapides aux modules
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { label: 'Gestion Licenciés', icon: Users, module: 'members' as ActiveModule },
                  { label: 'Calendrier Matchs', icon: Calendar, module: 'calendar' as ActiveModule },
                  { label: 'Caisse & Buvette', icon: Receipt, module: 'pos' as ActiveModule },
                  { label: 'Compositions Équipes', icon: Shield, module: 'teams' as ActiveModule },
                  { label: 'Parc Véhicules', icon: Truck, module: 'vehicles' as ActiveModule },
                  { label: 'Stocks Matériel', icon: Boxes, module: 'inventory' as ActiveModule },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleNavigate(item.module)}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-left transition-all group"
                    >
                      <Icon className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-slate-700 group-hover:text-blue-900">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : !hasResults ? (
            <div className="text-center py-10 text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium text-slate-600">Aucun résultat trouvé pour "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">Essayez avec un nom de famille, numéro de licence ou mot-clé.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Members Results */}
              {filteredMembers.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      Licenciés ({filteredMembers.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleNavigate('members')}
                      className="text-blue-600 hover:underline flex items-center gap-1 normal-case font-medium"
                    >
                      Voir tout <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {filteredMembers.slice(0, 4).map(m => (
                      <div
                        key={m.id}
                        onClick={() => handleNavigate('members')}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                            {m.firstName[0]}{m.lastName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {m.firstName} {m.lastName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {m.teamName} • {m.position} • {m.licenseNumber}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            m.licenseStatus === 'Validée'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {m.licenseStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Events Results */}
              {filteredEvents.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      Calendrier & Matchs ({filteredEvents.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleNavigate('calendar')}
                      className="text-indigo-600 hover:underline flex items-center gap-1 normal-case font-medium"
                    >
                      Voir tout <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {filteredEvents.slice(0, 3).map(e => (
                      <div
                        key={e.id}
                        onClick={() => handleNavigate('calendar')}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 cursor-pointer"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900">{e.title}</p>
                          <p className="text-xs text-slate-500">
                            {e.date} • {e.startTime} - {e.location}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                          {e.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Items Results */}
              {filteredInventory.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1.5">
                      <Boxes className="w-3.5 h-3.5 text-amber-600" />
                      Matériel & Stocks ({filteredInventory.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleNavigate('inventory')}
                      className="text-amber-600 hover:underline flex items-center gap-1 normal-case font-medium"
                    >
                      Voir tout <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {filteredInventory.slice(0, 3).map(i => (
                      <div
                        key={i.id}
                        onClick={() => handleNavigate('inventory')}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 cursor-pointer"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900">{i.name}</p>
                          <p className="text-xs text-slate-500">
                            {i.storageLocation} • QR: {i.qrCode}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {i.quantityAvailable}/{i.quantityTotal} dispo
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoices */}
              {filteredInvoices.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      Factures & Ventes ({filteredInvoices.length})
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {filteredInvoices.slice(0, 2).map(inv => (
                      <div
                        key={inv.id}
                        onClick={() => handleNavigate('invoices')}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 cursor-pointer"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900">{inv.number} - {inv.clientName}</p>
                          <p className="text-xs text-slate-500">Échéance: {inv.dueDate}</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-700">
                          {inv.amountTTC.toLocaleString('fr-FR')} €
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
