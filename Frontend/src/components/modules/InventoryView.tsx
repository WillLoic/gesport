import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  QrCode,
  CheckCircle,
  X,
  Package,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { InventoryItem } from '../../types';

export const InventoryView: React.FC = () => {
  const { inventory, setInventory, showToast } = useClub();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);

  // New Equipment Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Ballons');
  const [newStorageLocation, setNewStorageLocation] = useState('Local Matériel Principal - Casier B');
  const [newQuantityTotal, setNewQuantityTotal] = useState(20);
  const [newQuantityAvailable, setNewQuantityAvailable] = useState(20);
  const [newMinThreshold, setNewMinThreshold] = useState(5);
  const [newCondition, setNewCondition] = useState('Neuf');
  const [newAssignedTeam, setNewAssignedTeam] = useState('Général Club (Tous)');

  const categories = [
    'Ballons',
    'Filets & Poteaux',
    'Maillots & Chasubles',
    'Matériel Pédagogique',
    'Médical & Soins',
    'Buvette',
  ];

  const filteredItems = inventory.filter(item => {
    const matchesSearch =
      searchTerm === '' ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.storageLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleAdjustStock = (itemId: string, delta: number) => {
    setInventory(prev =>
      prev.map(i => {
        if (i.id === itemId) {
          const newQty = Math.max(0, i.quantityAvailable + delta);
          return { ...i, quantityAvailable: newQty, quantityTotal: Math.max(i.quantityTotal, newQty) };
        }
        return i;
      })
    );
    showToast('Niveau de stock actualisé !');
  };

  const handleCreateEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      showToast('Veuillez renseigner le libellé du matériel.');
      return;
    }

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: newName.trim(),
      category: newCategory as any,
      storageLocation: newStorageLocation.trim() || 'Gymnase Principal',
      quantityTotal: Number(newQuantityTotal) || 1,
      quantityAvailable: Number(newQuantityAvailable) || Number(newQuantityTotal) || 1,
      minThresholdAlert: Number(newMinThreshold) || 2,
      condition: newCondition as any,
      qrCode: `MAT-${Math.floor(1000 + Math.random() * 9000)}`,
      borrowHistory: [],
    };

    setInventory(prev => [newItem, ...prev]);
    setIsNewItemModalOpen(false);
    showToast(`Matériel "${newItem.name}" ajouté à l'inventaire avec succès !`);

    // Reset Form
    setNewName('');
    setNewQuantityTotal(10);
    setNewQuantityAvailable(10);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Stocks & Matériel Sportif</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Inventaire des ballons, trousses de secours, tenues de match, prêts de matériel et alertes réassort
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewItemModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          Ajouter du Matériel
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher équipement, armoire, référence..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-hidden"
        >
          <option value="all">Toutes les catégories ({inventory.length})</option>
          {categories.map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Équipement & Réf</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Lieu de Stockage</th>
                <th className="py-3 px-4 text-center">Disponible</th>
                <th className="py-3 px-4 text-center">État & Alerte</th>
                <th className="py-3 px-4 text-right">Ajustement Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredItems.map(item => {
                const isLowStock = item.quantityAvailable <= item.minThresholdAlert;
                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <span className="text-[10px] font-mono text-slate-400">QR: {item.qrCode}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{item.category}</td>
                    <td className="py-3 px-4 text-slate-600">{item.storageLocation}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900 text-base">
                      {item.quantityAvailable} <span className="text-xs font-normal text-slate-400">/ {item.quantityTotal}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                          <AlertTriangle className="w-3 h-3" />
                          Stock Faible (&le; {item.minThresholdAlert})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3" />
                          {item.condition}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAdjustStock(item.id, -1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-sm flex items-center justify-center cursor-pointer"
                          title="Retirer 1 unité"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustStock(item.id, +1)}
                          className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-sm flex items-center justify-center cursor-pointer"
                          title="Ajouter 1 unité"
                        >
                          +
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

      {/* New Equipment Modal */}
      {isNewItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 font-display">Ajouter du Matériel au Stock</h3>
                  <p className="text-xs text-slate-500">Enregistrement d'équipement, localisation et seuil d'alerte</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewItemModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEquipment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nom du Matériel / Équipement *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ballons Mikasa V200W"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Catégorie
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Quantité Totale
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newQuantityTotal}
                    onChange={e => {
                      const v = Number(e.target.value);
                      setNewQuantityTotal(v);
                      setNewQuantityAvailable(v);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Quantité Dispo
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={newQuantityTotal}
                    value={newQuantityAvailable}
                    onChange={e => setNewQuantityAvailable(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Seuil Alerte Stock
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newMinThreshold}
                    onChange={e => setNewMinThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Lieu de Stockage
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Local Matériel Gymnase Principal - Armoire 3"
                    value={newStorageLocation}
                    onChange={e => setNewStorageLocation(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    État du Matériel
                  </label>
                  <select
                    value={newCondition}
                    onChange={e => setNewCondition(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    <option value="Neuf">Neuf</option>
                    <option value="Très bon état">Très bon état</option>
                    <option value="Bon état">Bon état</option>
                    <option value="Usagé / Entraînement">Usagé / Entraînement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Affectation / Équipe Principale
                </label>
                <input
                  type="text"
                  placeholder="Ex: Équipe Pro, Section Jeunes, Tous..."
                  value={newAssignedTeam}
                  onChange={e => setNewAssignedTeam(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewItemModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors"
                >
                  Enregistrer l'Équipement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
