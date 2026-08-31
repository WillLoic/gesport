import React, { useState } from 'react';
import {
  Store,
  CreditCard,
  Banknote,
  Coins,
  Receipt,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { PosProduct, PosOrder } from '../../types';

export const PosCashRegisterView: React.FC = () => {
  const { posProducts, posOrders, setPosOrders, showToast } = useClub();

  const [cart, setCart] = useState<{ product: PosProduct; quantity: number }[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = ['Boissons', 'Snacks & Sandwichs', 'Boutique Match', 'Confiserie'];

  const filteredItems = posProducts.filter(item => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const handleAddToCart = (product: PosProduct) => {
    setCart(prev => {
      const existing = prev.find(p => p.product.id === product.id);
      if (existing) {
        return prev.map(p => (p.product.id === product.id ? { ...p, quantity: p.quantity + 1 } : p));
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(p => {
          if (p.product.id === productId) {
            const nextQty = p.quantity + delta;
            return nextQty > 0 ? { ...p, quantity: nextQty } : null;
          }
          return p;
        })
        .filter(Boolean) as { product: PosProduct; quantity: number }[]
    );
  };

  const cartTotal = cart.reduce((acc, p) => acc + p.product.price * p.quantity, 0);

  const handleCheckout = (paymentMethod: 'Carte Bancaire' | 'Espèces' | 'Jetons Buvette') => {
    if (cart.length === 0) return;

    const newOrder: PosOrder = {
      id: `pos-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      items: cart.map(c => ({
        productId: c.product.id,
        name: c.product.name,
        qty: c.quantity,
        unitPrice: c.product.price,
      })),
      total: cartTotal,
      paymentMethod,
      cashierName: 'Bénévole Buvette',
    };

    setPosOrders(prev => [newOrder, ...prev]);
    setCart([]);
    showToast(`Paiement de ${cartTotal.toFixed(2)} € validé (${paymentMethod}) !`);
  };

  const dayTotalRevenue = posOrders.reduce((acc, order) => acc + order.total, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Caisse Buvette & Point de Vente</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Encaissement tactile jour de match, boissons, restauration rapide et clôture de caisse Z
          </p>
        </div>

        {/* Daily Total Badge */}
        <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-200">
          <Store className="w-5 h-5 text-emerald-600" />
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-800">Recette du Jour</span>
            <p className="text-base font-bold text-emerald-950">{dayTotalRevenue.toFixed(2)} €</p>
          </div>
        </div>
      </div>

      {/* POS Grid: Catalog (Left) + Cart Terminal (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Catalog Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Tout le catalogue
            </button>
            {categories.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setActiveCategory(c)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeCategory === c
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Product Cards Tiles (Touch Optimized) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredItems.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleAddToCart(item)}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-left flex flex-col justify-between h-32 active:scale-95 group"
              >
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                    {item.category}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 mt-1 line-clamp-2">{item.name}</h3>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                  <span className="text-base font-bold text-slate-900">{item.price.toFixed(2)} €</span>
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 font-bold text-sm flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    +
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Cart & Payment Terminal */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                Panier Commande
              </h3>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  Vider
                </button>
              )}
            </div>

            {/* Cart items list */}
            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto my-3">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Toucher les articles à gauche pour garnir la commande.
                </div>
              ) : (
                cart.map(line => (
                  <div key={line.product.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{line.product.name}</p>
                      <p className="text-slate-400">{(line.product.price * line.quantity).toFixed(2)} €</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(line.product.id, -1)}
                        className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-bold flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm text-slate-900 w-4 text-center">{line.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(line.product.id, 1)}
                        className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 font-bold flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cart Total & Checkout Buttons */}
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-base">
              <span className="font-bold text-slate-600">Total à Payer :</span>
              <span className="text-2xl font-black text-slate-900 font-display">
                {cartTotal.toFixed(2)} €
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={cart.length === 0}
                onClick={() => handleCheckout('Carte Bancaire')}
                className="py-3 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs flex flex-col items-center gap-1 shadow-sm transition-all"
              >
                <CreditCard className="w-4 h-4" />
                Carte CB
              </button>

              <button
                type="button"
                disabled={cart.length === 0}
                onClick={() => handleCheckout('Espèces')}
                className="py-3 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs flex flex-col items-center gap-1 shadow-sm transition-all"
              >
                <Banknote className="w-4 h-4" />
                Espèces
              </button>

              <button
                type="button"
                disabled={cart.length === 0}
                onClick={() => handleCheckout('Jetons Buvette')}
                className="py-3 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs flex flex-col items-center gap-1 shadow-sm transition-all"
              >
                <Coins className="w-4 h-4" />
                Jetons
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
