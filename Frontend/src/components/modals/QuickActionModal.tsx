import React, { useState } from 'react';
import {
  X,
  UserPlus,
  CalendarPlus,
  Dumbbell,
  Receipt,
  WalletCards,
  ShoppingBag,
  Store,
  Upload,
  HeartHandshake,
  CheckCircle,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { Member, SportEvent, TrainingSession, FinancialTransaction, ExpenseClaim } from '../../types';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ActionType = 'menu' | 'member' | 'event' | 'training' | 'finance' | 'expense';

export const QuickActionModal: React.FC<QuickActionModalProps> = ({ isOpen, onClose }) => {
  const {
    teams,
    members,
    setMembers,
    events,
    setEvents,
    trainings,
    setTrainings,
    finances,
    setFinances,
    expenses,
    setExpenses,
    showToast,
    setActiveModule,
  } = useClub();

  const [currentStep, setCurrentStep] = useState<ActionType>('menu');

  // Form states
  const [memberForm, setMemberForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    category: 'Senior Régionale' as any,
    teamId: 't1',
    position: 'Polyvalent',
    licenseNumber: `FFVB-2025-${Math.floor(100000 + Math.random() * 900000)}`,
  });

  const [eventForm, setEventForm] = useState({
    title: '',
    type: 'match_official' as any,
    teamId: 't1',
    opponent: '',
    isHome: true,
    date: new Date().toISOString().split('T')[0],
    startTime: '20:00',
    location: 'Gymnase Gerland (Lyon)',
  });

  const [financeForm, setFinanceForm] = useState({
    label: '',
    type: 'Recette' as any,
    category: 'Cotisations' as any,
    amount: '',
    paymentMethod: 'Virement' as any,
  });

  if (!isOpen) return null;

  const handleClose = () => {
    setCurrentStep('menu');
    onClose();
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.firstName || !memberForm.lastName) return;

    const team = teams.find(t => t.id === memberForm.teamId);
    const newMember: Member = {
      id: `m-${Date.now()}`,
      firstName: memberForm.firstName,
      lastName: memberForm.lastName,
      email: memberForm.email || `${memberForm.firstName.toLowerCase()}.${memberForm.lastName.toLowerCase()}@email.fr`,
      phone: memberForm.phone || '06 00 00 00 00',
      gender: 'M',
      birthDate: '2002-01-01',
      category: memberForm.category,
      teamId: memberForm.teamId,
      teamName: team ? team.name : 'Équipe 1',
      licenseNumber: memberForm.licenseNumber,
      licenseStatus: 'Validée',
      season: '2024-2025',
      medicalCertDate: new Date().toISOString().split('T')[0],
      medicalCertValid: true,
      position: memberForm.position,
      jerseyNumber: Math.floor(Math.random() * 20) + 1,
      paymentStatus: 'À jour',
      amountDue: 300,
      amountPaid: 300,
      emergencyContact: {
        name: 'Contact Urgence',
        phone: '06 00 00 00 00',
        relation: 'Famille',
      },
      address: 'Lyon',
    };

    setMembers([newMember, ...members]);
    showToast(`Licencié ${newMember.firstName} ${newMember.lastName} ajouté avec succès !`);
    setActiveModule('members');
    handleClose();
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title) return;

    const team = teams.find(t => t.id === eventForm.teamId);
    const newEvent: SportEvent = {
      id: `e-${Date.now()}`,
      title: eventForm.title,
      type: eventForm.type,
      teamId: eventForm.teamId,
      teamName: team ? team.name : 'Club',
      opponent: eventForm.opponent,
      isHome: eventForm.isHome,
      date: eventForm.date,
      startTime: eventForm.startTime,
      endTime: '22:00',
      location: eventForm.location,
      hall: 'Salle Principale',
      convocationTime: '18:45',
      status: 'Programmé',
      summonedPlayers: members.filter(m => m.teamId === eventForm.teamId).map(m => ({
        playerId: m.id,
        playerName: `${m.firstName} ${m.lastName}`,
        status: 'En attente',
        transport: 'Voiture perso',
      })),
    };

    setEvents([newEvent, ...events]);
    showToast(`Événement "${newEvent.title}" programmé avec succès !`);
    setActiveModule('calendar');
    handleClose();
  };

  const handleCreateFinance = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(financeForm.amount);
    if (!financeForm.label || isNaN(amountNum)) return;

    const newTx: FinancialTransaction = {
      id: `ft-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      label: financeForm.label,
      type: financeForm.type,
      category: financeForm.category,
      amount: amountNum,
      paymentMethod: financeForm.paymentMethod,
      status: 'Rapproché',
    };

    setFinances([newTx, ...finances]);
    showToast(`Écriture comptable de ${amountNum.toLocaleString('fr-FR')} € enregistrée !`);
    setActiveModule('finance');
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {currentStep === 'menu' && 'Action Rapide — Création & Enregistrement'}
              {currentStep === 'member' && 'Nouveau Licencié'}
              {currentStep === 'event' && 'Nouveau Match / Événement'}
              {currentStep === 'finance' && 'Nouvelle Écriture Financière'}
            </h3>
            <p className="text-xs text-slate-500">VolleyPro Club Management System</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {currentStep === 'menu' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep('member')}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-left transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">Ajouter un licencié</div>
                  <div className="text-xs text-slate-500">Dossier, licence & équipe</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep('event')}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 text-left transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CalendarPlus className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">Créer un match / convocation</div>
                  <div className="text-xs text-slate-500">Championnat, amical ou tournoi</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep('finance')}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">Écriture financière</div>
                  <div className="text-xs text-slate-500">Recette, subvention ou dépense</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveModule('pos');
                  handleClose();
                }}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/40 text-left transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">Ouvrir Caisse Buvette</div>
                  <div className="text-xs text-slate-500">Point de vente jour de match</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveModule('trainings');
                  handleClose();
                }}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 text-left transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">Préparer une séance</div>
                  <div className="text-xs text-slate-500">Schémas d'exercices & tactique</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveModule('expenses');
                  handleClose();
                }}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50/40 text-left transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <WalletCards className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">Déclarer note de frais</div>
                  <div className="text-xs text-slate-500">Déplacement km ou repas</div>
                </div>
              </button>
            </div>
          )}

          {/* Member Form */}
          {currentStep === 'member' && (
            <form onSubmit={handleCreateMember} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Maxime"
                    value={memberForm.firstName}
                    onChange={e => setMemberForm({ ...memberForm, firstName: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-600 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dupuis"
                    value={memberForm.lastName}
                    onChange={e => setMemberForm({ ...memberForm, lastName: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-600 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Équipe assignée</label>
                  <select
                    value={memberForm.teamId}
                    onChange={e => setMemberForm({ ...memberForm, teamId: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-blue-600 outline-hidden"
                  >
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Poste de jeu</label>
                  <select
                    value={memberForm.position}
                    onChange={e => setMemberForm({ ...memberForm, position: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-blue-600 outline-hidden"
                  >
                    <option value="Passeur">Passeur</option>
                    <option value="Réceptionneur-Attaquant">Réceptionneur-Attaquant</option>
                    <option value="Central">Central</option>
                    <option value="Pointu">Pointu</option>
                    <option value="Libero">Libero</option>
                    <option value="Polyvalent">Polyvalent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="licencie@email.fr"
                    value={memberForm.email}
                    onChange={e => setMemberForm({ ...memberForm, email: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-600 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    placeholder="06 12 34 56 78"
                    value={memberForm.phone}
                    onChange={e => setMemberForm({ ...memberForm, phone: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-600 outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep('menu')}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                >
                  Enregistrer le licencié
                </button>
              </div>
            </form>
          )}

          {/* Event Form */}
          {currentStep === 'event' && (
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Intitulé du match ou événement *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: N1M vs Annecy Volley"
                  value={eventForm.title}
                  onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-600 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={eventForm.type}
                    onChange={e => setEventForm({ ...eventForm, type: e.target.value as any })}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="match_official">Match Officiel Championnat</option>
                    <option value="match_friendly">Match Amical</option>
                    <option value="training">Entraînement</option>
                    <option value="tournament">Tournoi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Équipe du club</label>
                  <select
                    value={eventForm.teamId}
                    onChange={e => setEventForm({ ...eventForm, teamId: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Heure de début</label>
                  <input
                    type="time"
                    value={eventForm.startTime}
                    onChange={e => setEventForm({ ...eventForm, startTime: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep('menu')}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Créer l’événement
                </button>
              </div>
            </form>
          )}

          {/* Finance Form */}
          {currentStep === 'finance' && (
            <form onSubmit={handleCreateFinance} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description de l'opération *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Subvention Jeunesse & Sport 2025"
                  value={financeForm.label}
                  onChange={e => setFinanceForm({ ...financeForm, label: e.target.value })}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-600 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Type d'opération</label>
                  <select
                    value={financeForm.type}
                    onChange={e => setFinanceForm({ ...financeForm, type: e.target.value as any })}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="Recette">Recette (+)</option>
                    <option value="Dépense">Dépense (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Montant (€ TTC) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ex: 1500.00"
                    value={financeForm.amount}
                    onChange={e => setFinanceForm({ ...financeForm, amount: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-600 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Catégorie</label>
                  <select
                    value={financeForm.category}
                    onChange={e => setFinanceForm({ ...financeForm, category: e.target.value as any })}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="Cotisations">Cotisations Membres</option>
                    <option value="Subventions Mairie/Département">Subvention Publique</option>
                    <option value="Sponsors & Mécènes">Sponsoring / Mécénat</option>
                    <option value="Buvette & Événements">Buvette & Billetterie</option>
                    <option value="Salaires & Charges">Salaires & Encadrement</option>
                    <option value="Matériel & Équipements">Matériel & Équipements</option>
                    <option value="Déplacements & Péages">Déplacements & Transports</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Moyen de paiement</label>
                  <select
                    value={financeForm.paymentMethod}
                    onChange={e => setFinanceForm({ ...financeForm, paymentMethod: e.target.value as any })}
                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="Virement">Virement Bancaire</option>
                    <option value="Carte Bancaire">Carte Bancaire</option>
                    <option value="Prélèvement">Prélèvement Automatique</option>
                    <option value="Chèque">Chèque</option>
                    <option value="Espèces">Espèces</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep('menu')}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  Enregistrer l’écriture
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
