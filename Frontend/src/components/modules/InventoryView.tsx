import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  QrCode,
  CheckCircle,
  X,
  Package,
  Trash2,
  Pencil,
  Clock,
  UserCheck,
  Handshake,
  ArrowRightLeft,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { InventoryItem } from '../../types';
import { inventoryService, loanService, EquipmentLoanItem } from '../../services/operationsService';

export const InventoryView: React.FC = () => {
  const { inventory, setInventory, showToast } = useClub();
  const [activeTab, setActiveTab] = useState<'stock' | 'loans'>('stock');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Loans State
  const [loans, setLoans] = useState<EquipmentLoanItem[]>([]);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [loanEquipmentId, setLoanEquipmentId] = useState<string>('');
  const [loanBorrowerName, setLoanBorrowerName] = useState('');
  const [loanBorrowerEmail, setLoanBorrowerEmail] = useState('');
  const [loanQuantity, setLoanQuantity] = useState(1);
  const [loanExpectedReturnDate, setLoanExpectedReturnDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [loanNotes, setLoanNotes] = useState('');

  // New Equipment Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Ballons');
  const [newStorageLocation, setNewStorageLocation] = useState('');
  const [newQuantityTotal, setNewQuantityTotal] = useState(10);
  const [newQuantityAvailable, setNewQuantityAvailable] = useState(10);
  const [newMinThreshold, setNewMinThreshold] = useState(5);
  const [newCondition, setNewCondition] = useState('Neuf');
  const [newAssignedTeam, setNewAssignedTeam] = useState('');

  const categories = [
    'Ballons',
    'Filets & Poteaux',
    'Maillots & Chasubles',
    'Matériel Pédagogique',
    'Médical & Soins',
    'Buvette',
  ];

  // Chargement des emprunts au montage
  useEffect(() => {
    loanService
      .getLoans()
      .then(data => setLoans(data || []))
      .catch(err => console.warn('Erreur chargement emprunts backend:', err));
  }, []);

  const filteredItems = inventory.filter(item => {
    if (!item) return false;
    const nameStr = item.name || '';
    const locStr = item.storageLocation || '';
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === '' ||
      nameStr.toLowerCase().includes(searchLower) ||
      locStr.toLowerCase().includes(searchLower);
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const filteredLoans = loans.filter(l => {
    if (!l) return false;
    const borrower = l.borrowerName || '';
    const notes = l.notes || '';
    const searchLower = searchTerm.toLowerCase();
    return (
      searchTerm === '' ||
      borrower.toLowerCase().includes(searchLower) ||
      notes.toLowerCase().includes(searchLower)
    );
  });

  const handleAdjustStock = async (itemId: string, delta: number) => {
    const item = inventory.find(i => i && i.id === itemId);
    if (!item) return;

    const newQty = Math.max(0, (item.quantityAvailable || 0) + delta);
    const itemIdNum = Number(itemId);

    if (!isNaN(itemIdNum)) {
      try {
        const updated = await inventoryService.updateEquipmentStock(itemIdNum, newQty);
        setInventory(prev => prev.map(i => (i && i.id === itemId ? updated : i)));
        showToast('Niveau de stock actualisé !');
        return;
      } catch (err) {
        console.warn('Erreur ajustement stock backend:', err);
      }
    }

    setInventory(prev =>
      prev.map(i => {
        if (i && i.id === itemId) {
          return { ...i, quantityAvailable: newQty, quantityTotal: Math.max(i.quantityTotal || 0, newQty) };
        }
        return i;
      })
    );
    showToast('Niveau de stock actualisé !');
  };

  const handleCreateEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      showToast('Veuillez renseigner le libellé du matériel.');
      return;
    }

    const payload: Partial<InventoryItem> = {
      name: newName.trim(),
      category: newCategory as any,
      quantityTotal: Number(newQuantityTotal) || 1,
      quantityAvailable: Number(newQuantityAvailable) || Number(newQuantityTotal) || 1,
      minThresholdAlert: Number(newMinThreshold) || 2,
      condition: newCondition as any,
      storageLocation: newStorageLocation.trim() || 'Gymnase Principal',
    };

    try {
      const created = await inventoryService.createEquipment(payload);
      setInventory(prev => [created, ...prev]);
      showToast(`Matériel "${created.name}" ajouté au stock avec succès !`);
    } catch (err) {
      console.error('Erreur création matériel backend:', err);
      const newItem: InventoryItem = {
        id: `inv-${Date.now()}`,
        name: payload.name!,
        category: payload.category!,
        storageLocation: payload.storageLocation!,
        quantityTotal: payload.quantityTotal!,
        quantityAvailable: payload.quantityAvailable!,
        minThresholdAlert: payload.minThresholdAlert!,
        condition: payload.condition!,
        qrCode: `MAT-${Math.floor(1000 + Math.random() * 9000)}`,
        borrowHistory: [],
      };
      setInventory(prev => [newItem, ...prev]);
      showToast(`Matériel "${newItem.name}" ajouté (mode hors-ligne) !`);
    }

    setIsNewItemModalOpen(false);
    setNewName('');
    setNewStorageLocation('');
    setNewAssignedTeam('');
    setNewQuantityTotal(10);
    setNewQuantityAvailable(10);
  };

  const handleUpdateEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name.trim()) return;

    const itemIdNum = Number(editingItem.id);
    if (!isNaN(itemIdNum)) {
      try {
        const updated = await inventoryService.updateEquipment(itemIdNum, editingItem);
        setInventory(prev => prev.map(i => (i && i.id === editingItem.id ? updated : i)));
        showToast(`Matériel "${updated.name}" mis à jour avec succès !`);
        setEditingItem(null);
        return;
      } catch (err) {
        console.warn('Erreur mise à jour matériel backend:', err);
      }
    }

    setInventory(prev =>
      prev.map(i => (i && i.id === editingItem.id ? editingItem : i))
    );
    showToast(`Matériel "${editingItem.name}" mis à jour avec succès !`);
    setEditingItem(null);
  };

  const handleDeleteEquipment = async (itemId: string) => {
    const itemIdNum = Number(itemId);
    if (!isNaN(itemIdNum)) {
      try {
        await inventoryService.deleteEquipment(itemIdNum);
      } catch (err) {
        console.warn('Erreur suppression matériel backend:', err);
      }
    }

    setInventory(prev => prev.filter(i => i && i.id !== itemId));
    showToast('Matériel retiré de l\'inventaire.');
  };

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanBorrowerName.trim()) {
      showToast('Veuillez renseigner le nom de l\'emprunteur.');
      return;
    }

    const eqId = Number(loanEquipmentId) || (inventory[0] ? Number(inventory[0].id) : 1);

    try {
      const createdLoan = await loanService.createLoan({
        equipmentId: eqId,
        borrowerName: loanBorrowerName.trim(),
        borrowerEmail: loanBorrowerEmail.trim() || 'emprunteur@club.com',
        expectedReturnDate: loanExpectedReturnDate,
        quantity: Number(loanQuantity) || 1,
        notes: loanNotes.trim() || 'Prêt de matériel',
      });
      setLoans(prev => [createdLoan, ...prev]);

      // Décrémenter localement la quantité dispo
      setInventory(prev =>
        prev.map(item => {
          if (Number(item.id) === eqId) {
            const newQty = Math.max(0, item.quantityAvailable - (Number(loanQuantity) || 1));
            return { ...item, quantityAvailable: newQty };
          }
          return item;
        })
      );
      showToast(`Emprunt enregistré pour ${loanBorrowerName.trim()} !`);
    } catch (err: any) {
      console.warn('Erreur création emprunt backend:', err);
      showToast(err.message || 'Erreur lors de la création de l\'emprunt.');
    }

    setIsLoanModalOpen(false);
    setLoanBorrowerName('');
    setLoanBorrowerEmail('');
    setLoanNotes('');
  };

  const handleReturnLoan = async (loanId: string, equipmentId: number, quantity: number) => {
    const loanIdNum = Number(loanId);
    if (!isNaN(loanIdNum)) {
      try {
        const updatedLoan = await loanService.returnLoan(loanIdNum, 'Restitué en bon état');
        setLoans(prev => prev.map(l => (l.id === loanId ? updatedLoan : l)));

        // Ré-incrémenter le stock dispo
        setInventory(prev =>
          prev.map(item => {
            if (Number(item.id) === equipmentId) {
              return { ...item, quantityAvailable: item.quantityAvailable + quantity };
            }
            return item;
          })
        );
        showToast('Matériel restitué avec succès !');
        return;
      } catch (err) {
        console.warn('Erreur restitution emprunt backend:', err);
      }
    }

    // Fallback local
    setLoans(prev =>
      prev.map(l => (l.id === loanId ? { ...l, status: 'Restitué' } : l))
    );
    showToast('Matériel restitué avec succès !');
  };

  const handleDeleteLoan = async (loanId: string) => {
    const loanIdNum = Number(loanId);
    if (!isNaN(loanIdNum)) {
      try {
        await loanService.deleteLoan(loanIdNum);
      } catch (err) {
        console.warn('Erreur suppression emprunt backend:', err);
      }
    }
    setLoans(prev => prev.filter(l => l.id !== loanId));
    showToast('Emprunt retiré de l\'historique.');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Stocks & Emprunts de Matériel</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Inventaire des ballons, tenues, trousses de secours, prêts aux entraîneurs et réassorts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsLoanModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs cursor-pointer transition-all"
          >
            <Handshake className="w-4 h-4 text-purple-600" />
            Nouveau Prêt
          </button>

          <button
            type="button"
            onClick={() => setIsNewItemModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            Ajouter du Matériel
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'stock'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Inventaire des Stocks ({inventory.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('loans')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'loans'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Prêts & Emprunts ({loans.filter(l => l.status === 'En cours').length} en cours)
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeTab === 'stock'
                ? "Rechercher équipement, armoire, référence..."
                : "Rechercher un emprunteur, notes..."
            }
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
          />
        </div>

        {activeTab === 'stock' && (
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
        )}
      </div>

      {/* TAB 1 : STOCKS TABLE */}
      {activeTab === 'stock' && (
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
                  <th className="py-3 px-4 text-right">Actions</th>
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
                          <button
                            type="button"
                            onClick={() => setEditingItem(item)}
                            className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-sm flex items-center justify-center cursor-pointer ml-1"
                            title="Modifier l'équipement"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEquipment(item.id)}
                            className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-sm flex items-center justify-center cursor-pointer ml-1"
                            title="Supprimer l'équipement"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      )}

      {/* TAB 2 : LOANS TABLE */}
      {activeTab === 'loans' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Emprunteur & Contact</th>
                  <th className="py-3 px-4">Équipement Concerneé</th>
                  <th className="py-3 px-4 text-center">Quantité</th>
                  <th className="py-3 px-4">Dates Prêt / Retour Prévu</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredLoans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs font-medium">
                      Aucun emprunt de matériel en cours ou répertorié.
                    </td>
                  </tr>
                ) : (
                  filteredLoans.map(loan => {
                    const linkedEquipment = inventory.find(i => Number(i.id) === loan.equipmentId);
                    const isActive = loan.status === 'En cours';

                    return (
                      <tr key={loan.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{loan.borrowerName}</div>
                          <span className="text-[10px] text-slate-400">{loan.borrowerEmail}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800">
                            {linkedEquipment ? linkedEquipment.name : `Équipement #${loan.equipmentId}`}
                          </div>
                          <span className="text-[10px] text-slate-400">{loan.notes}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-900 text-base">
                          {loan.quantity}
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-xs">
                          <div>Du : <span className="font-semibold">{loan.loanDate}</span></div>
                          <div>Au : <span className="font-semibold text-blue-700">{loan.expectedReturnDate}</span></div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isActive ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isActive ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                            {loan.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isActive && (
                              <button
                                type="button"
                                onClick={() => handleReturnLoan(loan.id, loan.equipmentId, loan.quantity)}
                                className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg cursor-pointer transition-colors"
                              >
                                Restituer
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteLoan(loan.id)}
                              className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                              title="Supprimer la fiche emprunt"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

      {/* Edit Equipment Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 font-display">Modifier l'Équipement</h3>
                  <p className="text-xs text-slate-500">Mise à jour des informations, du stock et du lieu de rangement</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateEquipment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nom du Matériel / Équipement *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.name}
                    onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Catégorie
                  </label>
                  <select
                    value={editingItem.category}
                    onChange={e => setEditingItem({ ...editingItem, category: e.target.value as any })}
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
                    value={editingItem.quantityTotal}
                    onChange={e => {
                      const v = Number(e.target.value);
                      setEditingItem({ ...editingItem, quantityTotal: v });
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
                    max={editingItem.quantityTotal}
                    value={editingItem.quantityAvailable}
                    onChange={e => setEditingItem({ ...editingItem, quantityAvailable: Number(e.target.value) })}
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
                    value={editingItem.minThresholdAlert}
                    onChange={e => setEditingItem({ ...editingItem, minThresholdAlert: Number(e.target.value) })}
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
                    value={editingItem.storageLocation}
                    onChange={e => setEditingItem({ ...editingItem, storageLocation: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    État du Matériel
                  </label>
                  <select
                    value={editingItem.condition}
                    onChange={e => setEditingItem({ ...editingItem, condition: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    <option value="Neuf">Neuf</option>
                    <option value="Très bon état">Très bon état</option>
                    <option value="Bon état">Bon état</option>
                    <option value="Usagé / Entraînement">Usagé / Entraînement</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition-colors"
                >
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Loan Modal */}
      {isLoanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Handshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 font-display">Enregistrer un Prêt de Matériel</h3>
                  <p className="text-xs text-slate-500">Prêt de matériel aux entraîneurs, éducateurs ou membres</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLoanModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLoan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Équipement à Emprunter *
                </label>
                <select
                  value={loanEquipmentId}
                  onChange={e => setLoanEquipmentId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                >
                  {inventory.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Disponible: {item.quantityAvailable})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nom de l'Emprunteur *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Coach Lucas, Julie Dupont..."
                    value={loanBorrowerName}
                    onChange={e => setLoanBorrowerName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email de l'Emprunteur
                  </label>
                  <input
                    type="email"
                    placeholder="emprunteur@club.com"
                    value={loanBorrowerEmail}
                    onChange={e => setLoanBorrowerEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Quantité Empruntée
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={loanQuantity}
                    onChange={e => setLoanQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date de Retour Prévue
                  </label>
                  <input
                    type="date"
                    value={loanExpectedReturnDate}
                    onChange={e => setLoanExpectedReturnDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Remarques / État initial
                </label>
                <input
                  type="text"
                  placeholder="Ex: Prêt pour le stage d'été U15..."
                  value={loanNotes}
                  onChange={e => setLoanNotes(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLoanModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md transition-colors"
                >
                  Enregistrer le Prêt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
