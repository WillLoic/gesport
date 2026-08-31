import React, { useState } from 'react';
import {
  Send,
  Mail,
  Smartphone,
  Plus,
  Eye,
  MousePointer,
  X,
  Users,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { MarketingCampaign } from '../../types';

export const MarketingCampaignsView: React.FC = () => {
  const { campaigns, setCampaigns, showToast } = useClub();
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);

  // New Campaign Form State
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignType, setCampaignType] = useState('Emailing Newsletter');
  const [targetAudience, setTargetAudience] = useState('Tous les licenciés & parents');
  const [recipientsCount, setRecipientsCount] = useState(280);
  const [campaignSubject, setCampaignSubject] = useState('');
  const [campaignBody, setCampaignBody] = useState('');
  const [sendImmediately, setSendImmediately] = useState(true);

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignTitle.trim()) {
      showToast('Veuillez renseigner le titre de la campagne.');
      return;
    }

    const newCamp: MarketingCampaign = {
      id: `camp-${Date.now()}`,
      title: campaignTitle.trim(),
      type: (campaignType.includes('SMS') ? 'Alerte SMS Urgente' : 'Emailing / Newsletter') as any,
      targetAudience: (targetAudience.includes('Parents') ? 'Parents d’élèves' : 'Tous les membres') as any,
      recipientsCount: Number(recipientsCount) || 100,
      sentDate: sendImmediately
        ? new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'Programmé',
      status: sendImmediately ? 'Envoyée' : 'Planifiée',
      openRatePct: sendImmediately ? Math.floor(Math.random() * 25 + 70) : undefined,
      clickRatePct: sendImmediately ? Math.floor(Math.random() * 20 + 35) : undefined,
      content: campaignBody.trim() || 'Communication officielle du club.',
    };

    setCampaigns(prev => [newCamp, ...prev]);
    setIsNewCampaignModalOpen(false);
    showToast(
      sendImmediately
        ? `Campagne "${newCamp.title}" envoyée à ${newCamp.recipientsCount} destinataires !`
        : `Campagne "${newCamp.title}" programmée avec succès !`
    );

    // Reset Form
    setCampaignTitle('');
    setCampaignSubject('');
    setCampaignBody('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Communication & Newsletters</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Campagnes d'emails aux licenciés, SMS urgents de reports de matchs et statistiques d'engagement
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewCampaignModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Campagne
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaigns.map(camp => (
          <div
            key={camp.id}
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition-all space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  {camp.type.includes('Email') ? <Mail className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{camp.title}</h3>
                  <span className="text-xs text-slate-400">Envoyée le {camp.sentDate || 'Récemment'}</span>
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                camp.status === 'Envoyée' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {camp.status}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
              <span className="text-slate-500 font-semibold">Cible :</span>
              <p className="font-bold text-slate-800">{camp.targetAudience} ({camp.recipientsCount} destinataires)</p>
            </div>

            {/* Performance KPIs */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center gap-2.5">
                <Eye className="w-4 h-4 text-blue-600" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-700">Taux d'ouverture</span>
                  <p className="text-sm font-bold text-slate-900">{camp.openRatePct ? `${camp.openRatePct}%` : 'En cours...'}</p>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center gap-2.5">
                <MousePointer className="w-4 h-4 text-indigo-600" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-700">Taux de clic</span>
                  <p className="text-sm font-bold text-slate-900">{camp.clickRatePct ? `${camp.clickRatePct}%` : 'En cours...'}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Campaign Modal */}
      {isNewCampaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 font-display">Nouvelle Campagne de Communication</h3>
                  <p className="text-xs text-slate-500">Diffusion par Emailing groupé ou notification SMS urgente</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewCampaignModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Titre Interne de la Campagne *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Newsletter Club de Mars, Alerte Intempéries Gymnase Fermé..."
                  value={campaignTitle}
                  onChange={e => setCampaignTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Canal de Diffusion
                  </label>
                  <select
                    value={campaignType}
                    onChange={e => setCampaignType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    <option value="Emailing Newsletter">Emailing HTML / Newsletter</option>
                    <option value="Alerte SMS Urgente">Alerte SMS Flash</option>
                    <option value="Notification App & Email">Mix Push + Email</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Audience Cible
                  </label>
                  <select
                    value={targetAudience}
                    onChange={e => {
                      setTargetAudience(e.target.value);
                      if (e.target.value.includes('Tous')) setRecipientsCount(280);
                      else if (e.target.value.includes('Parents')) setRecipientsCount(140);
                      else if (e.target.value.includes('Seniors')) setRecipientsCount(55);
                      else setRecipientsCount(30);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    <option value="Tous les licenciés & parents">Tous les licenciés & parents (280)</option>
                    <option value="École de Sport & Jeunes U7-U15">École de Sport & Jeunes U7-U15 (140)</option>
                    <option value="Seniors Compétition (Régionale & Nat)">Seniors Compétition (55)</option>
                    <option value="Bénévoles, Staff & Officiels">Bénévoles, Staff & Officiels (32)</option>
                    <option value="Club des Partenaires & Sponsors">Club des Partenaires & Sponsors (18)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Objet du Message
                </label>
                <input
                  type="text"
                  placeholder="Ex: [ALERTE CLUB] Informations importantes pour le week-end..."
                  value={campaignSubject}
                  onChange={e => setCampaignSubject(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contenu du Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Chers licenciés, nous vous informons que la rencontre de ce samedi se déroulera à 18h..."
                  value={campaignBody}
                  onChange={e => setCampaignBody(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="sendImmediatelyCheckbox"
                  checked={sendImmediately}
                  onChange={e => setSendImmediately(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="sendImmediatelyCheckbox" className="text-xs font-medium text-slate-700">
                  Diffuser immédiatement à toute la base d'adresses
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewCampaignModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  {sendImmediately ? 'Envoyer la Campagne' : 'Programmer la Campagne'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
