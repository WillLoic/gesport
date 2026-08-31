import React, { useState } from 'react';
import {
  BadgeDollarSign,
  Plus,
  Building,
  CheckCircle,
  FileCheck,
  X,
  Sparkles,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { SponsorPartner } from '../../types';

export const SponsorshipView: React.FC = () => {
  const { sponsors, setSponsors, showToast } = useClub();
  const [selectedSponsor, setSelectedSponsor] = useState<SponsorPartner | null>(sponsors[0] || null);
  const [isNewSponsorModalOpen, setIsNewSponsorModalOpen] = useState(false);

  // New Sponsor Form State
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [packageTier, setPackageTier] = useState('Partenaire Officiel');
  const [annualAmount, setAnnualAmount] = useState(3000);
  const [contractEndDate, setContractEndDate] = useState('2026-06-30');
  const [taxReceiptIssued, setTaxReceiptIssued] = useState(true);
  const [perk1, setPerk1] = useState('Logo sur site web & réseaux sociaux');
  const [perk2, setPerk2] = useState('Panneau gymnase 2x1m');
  const [perk3, setPerk3] = useState('2 Pass VIP rencontres à domicile');

  const totalSponsorIncome = sponsors.reduce((acc, s) => acc + s.annualAmount, 0);

  const handleCreateSponsor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactPerson.trim()) {
      showToast('Veuillez renseigner le nom de l’entreprise et le contact.');
      return;
    }

    const perksList = [perk1, perk2, perk3].filter(p => p.trim() !== '');

    const newSponsor: SponsorPartner = {
      id: `sp-${Date.now()}`,
      companyName: companyName.trim(),
      contactPerson: contactPerson.trim(),
      email: `partenariat@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      phone: '04 91 00 00 00',
      packageTier: packageTier as any,
      annualAmount: Number(annualAmount) || 0,
      contractStartDate: new Date().toISOString().split('T')[0],
      contractEndDate,
      status: 'Actif',
      perks: perksList.length > 0 ? perksList : ['Visibilité club', 'Invitations matchs'],
      taxReceiptIssued,
    };

    setSponsors(prev => [newSponsor, ...prev]);
    setSelectedSponsor(newSponsor);
    setIsNewSponsorModalOpen(false);
    showToast(`Partenaire "${newSponsor.companyName}" (${newSponsor.annualAmount.toLocaleString('fr-FR')} €/an) ajouté avec succès !`);

    // Reset
    setCompanyName('');
    setContactPerson('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Sponsoring & Mécénat d'Entreprise</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Gestion du club partenaires, contreparties visuelles, attestations Cerfa et convention de mécénat
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewSponsorModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          Ajouter un Partenaire
        </button>
      </div>

      {/* KPI Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BadgeDollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Budget Partenariats & Mécénat Annuel
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
              {totalSponsorIncome.toLocaleString('fr-FR')} € <span className="text-sm font-normal text-slate-400">/ an</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            {sponsors.length} entreprises engagées
          </span>
        </div>
      </div>

      {/* Sponsors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sponsors.map(sponsor => (
          <div
            key={sponsor.id}
            onClick={() => setSelectedSponsor(sponsor)}
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{sponsor.companyName}</h3>
                    <p className="text-xs text-slate-500">Contact: {sponsor.contactPerson}</p>
                  </div>
                </div>

                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {sponsor.status}
                </span>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Formule :</span>
                  <span className="text-blue-700">{sponsor.packageTier}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                  <span>Contribution :</span>
                  <span>{sponsor.annualAmount.toLocaleString('fr-FR')} € / an</span>
                </div>
              </div>

              {/* Perks List */}
              <div className="mt-3 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Contreparties :</span>
                <ul className="text-xs text-slate-600 space-y-0.5">
                  {sponsor.perks.map((p, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="truncate">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {sponsor.taxReceiptIssued ? (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5" /> Reçu Cerfa délivré
                </span>
              ) : (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    showToast(`Reçu fiscal Cerfa généré pour ${sponsor.companyName}.`);
                  }}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Générer Cerfa
                </button>
              )}

              <span className="text-xs text-slate-400">Fin : {sponsor.contractEndDate}</span>
            </div>
          </div>
        ))}
      </div>

      {/* New Sponsor Modal */}
      {isNewSponsorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 font-display">Nouveau Partenaire / Sponsor</h3>
                  <p className="text-xs text-slate-500">Ajout d'une entreprise au club des partenaires</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewSponsorModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSponsor} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Raison Sociale / Entreprise *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: BNP Paribas Provence, Restaurant Le Panier, Transport Express..."
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Contact Référent *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Julie Morel (Directrice Com)"
                    value={contactPerson}
                    onChange={e => setContactPerson(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Formule de Partenariat
                  </label>
                  <select
                    value={packageTier}
                    onChange={e => setPackageTier(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    <option value="Partenaire Majeur">Partenaire Majeur (Face Maillot Pro)</option>
                    <option value="Partenaire Officiel">Partenaire Officiel (Manche / Dos)</option>
                    <option value="Partenaire Fournisseur">Fournisseur Officiel (Équipement)</option>
                    <option value="Mécène Bienfaiteur">Mécène Bienfaiteur (Don défiscalisé)</option>
                    <option value="Partenaire Local">Partenaire Club Local (Bâche)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Montant Annuel (€ / an) *
                  </label>
                  <input
                    type="number"
                    min={100}
                    required
                    value={annualAmount}
                    onChange={e => setAnnualAmount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-bold text-slate-900 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Fin du Contrat
                  </label>
                  <input
                    type="date"
                    value={contractEndDate}
                    onChange={e => setContractEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              {/* Perks Customization */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Contreparties Incluses
                </label>
                <input
                  type="text"
                  placeholder="Contrepartie 1 (ex: Logo maillot)"
                  value={perk1}
                  onChange={e => setPerk1(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 outline-hidden"
                />
                <input
                  type="text"
                  placeholder="Contrepartie 2 (ex: Bâche gymnase)"
                  value={perk2}
                  onChange={e => setPerk2(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 outline-hidden"
                />
                <input
                  type="text"
                  placeholder="Contrepartie 3 (ex: Places VIP)"
                  value={perk3}
                  onChange={e => setPerk3(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="cerfaCheckbox"
                  checked={taxReceiptIssued}
                  onChange={e => setTaxReceiptIssued(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="cerfaCheckbox" className="text-xs font-medium text-slate-700">
                  Délivrer immédiatement l'attestation fiscale Cerfa (Mécénat / Don)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewSponsorModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors"
                >
                  Enregistrer le Partenaire
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
