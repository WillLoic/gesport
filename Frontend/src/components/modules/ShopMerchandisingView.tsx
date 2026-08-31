import React, { useState } from 'react';
import {
  Shirt,
  Plus,
  ShoppingBag,
  Sparkles,
  X,
  Package,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { ShopProduct } from '../../types';

export const ShopMerchandisingView: React.FC = () => {
  const { shopProducts, setShopProducts, showToast } = useClub();
  const [selectedCat, setSelectedCat] = useState('all');
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);

  // New Product Form State
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('Maillots Officiels');
  const [productPrice, setProductPrice] = useState(49.9);
  const [productStock, setProductStock] = useState(25);
  const [productDescription, setProductDescription] = useState('');
  const [productSizes, setProductSizes] = useState('S, M, L, XL, XXL');
  const [canCustomPrint, setCanCustomPrint] = useState(true);

  const categories = [
    'Maillots Officiels',
    'Survêtements & Vestes',
    'Sacs & Bagagerie',
    'Accessoires & Goodies',
  ];

  const filteredProducts = shopProducts.filter(p =>
    selectedCat === 'all' ? true : p.category === selectedCat
  );

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      showToast('Veuillez renseigner le nom de l’article.');
      return;
    }

    const sizesArr = productSizes
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const newProd: ShopProduct = {
      id: `prod-${Date.now()}`,
      name: productName.trim(),
      category: productCategory as any,
      price: Number(productPrice) || 0,
      description: productDescription.trim() || 'Article officiel de la collection du club.',
      image: '',
      inStock: (Number(productStock) || 0) > 0,
      sizes: sizesArr.length > 0 ? sizesArr : ['Unique'],
      stockQty: Number(productStock) || 0,
      canCustomPrint,
    };

    setShopProducts(prev => [newProd, ...prev]);
    setIsNewProductModalOpen(false);
    showToast(`Nouvel article "${newProd.name}" (${newProd.price.toFixed(2)} €) ajouté à la boutique !`);

    // Reset Form
    setProductName('');
    setProductDescription('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Boutique Officielle du Club</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Articles de merchandising, tenues personnalisées avec flocage officiel, gestion des stocks et commandes
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewProductModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          Ajouter un Article
        </button>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedCat('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedCat === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Tous les articles ({shopProducts.length})
        </button>
        {categories.map(c => (
          <button
            key={c}
            type="button"
            onClick={() => setSelectedCat(c)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCat === c
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map(prod => (
          <div
            key={prod.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="p-4 flex items-center justify-center bg-slate-50 relative min-h-[160px]">
              <div className="w-20 h-20 rounded-2xl bg-blue-100/70 text-blue-700 flex items-center justify-center shadow-inner">
                <Shirt className="w-10 h-10" />
              </div>
              {prod.canCustomPrint && (
                <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Flocage dispo
                </span>
              )}
            </div>

            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {prod.category}
                </span>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 mt-1">{prod.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{prod.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-lg font-black text-slate-900 font-display">
                    {prod.price.toFixed(2)} €
                  </span>
                  <p className="text-[10px] text-slate-400">Stock : {prod.stockQty} unités</p>
                </div>

                <button
                  type="button"
                  onClick={() => showToast(`Article ${prod.name} ajouté à la commande du licencié.`)}
                  className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs transition-colors cursor-pointer"
                  title="Commander l'article"
                >
                  <ShoppingBag className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Product Modal */}
      {isNewProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Shirt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 font-display">Nouvel Article Boutique</h3>
                  <p className="text-xs text-slate-500">Ajout d'un produit officiel au catalogue du club</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewProductModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Désignation de l'Article *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Maillot Domicile Match 2025/2026, Veste Training Zippée..."
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Catégorie
                  </label>
                  <select
                    value={productCategory}
                    onChange={e => setProductCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    <option value="Maillots Officiels">Maillots Officiels</option>
                    <option value="Survêtements & Vestes">Survêtements & Vestes</option>
                    <option value="Sacs & Bagagerie">Sacs & Bagagerie</option>
                    <option value="Accessoires & Goodies">Accessoires & Goodies</option>
                    <option value="Équipements & Protections">Équipements & Protections</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Prix de Vente (€ TTC) *
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    min={0.5}
                    required
                    value={productPrice}
                    onChange={e => setProductPrice(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-bold text-slate-900 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Stock Initial (Unités) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={productStock}
                    onChange={e => setProductStock(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tailles Disponibles (séparées par virgule)
                  </label>
                  <input
                    type="text"
                    placeholder="S, M, L, XL, XXL"
                    value={productSizes}
                    onChange={e => setProductSizes(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description & Composition
                </label>
                <textarea
                  rows={2}
                  placeholder="Tissu respirant 100% polyester technique, écusson brodé haute définition..."
                  value={productDescription}
                  onChange={e => setProductDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="flocageCheckbox"
                  checked={canCustomPrint}
                  onChange={e => setCanCustomPrint(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="flocageCheckbox" className="text-xs font-medium text-slate-700">
                  Option flocage officiel disponible (Nom + Numéro dans le dos)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewProductModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors"
                >
                  Ajouter au Catalogue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
