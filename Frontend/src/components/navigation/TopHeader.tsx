import React, { useState } from 'react';
import {
  Menu,
  Search,
  Plus,
  Bell,
  ChevronDown,
  Building2,
  ShieldCheck,
  User,
  LogOut,
  LogIn,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { useAuth } from '../../context/AuthContext';

interface TopHeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenSearch: () => void;
  onOpenQuickAction: () => void;
  onOpenNotifications: () => void;
  isSidebarCollapsed: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenMobileSidebar,
  onOpenSearch,
  onOpenQuickAction,
  onOpenNotifications,
}) => {
  const {
    activeModule,
    members,
    medicalRecords,
    invoices,
    isPublicSiteOpen,
  } = useClub();

  const {
    currentUser,
    activeClub,
    activeRole,
    isAuthenticated,
    openAuthModal,
    openProfileModal,
    openClubSwitchModal,
    openRoleModal,
    logout,
  } = useAuth();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Alerts counter
  const totalAlerts =
    members.filter(m => !m.medicalCertValid || m.licenseStatus === 'Expirée').length +
    medicalRecords.filter(m => m.status === 'Indisponible').length +
    invoices.filter(i => i.status === 'En retard').length;

  const getModuleTitle = () => {
    if (isPublicSiteOpen) return "Site Web Officiel & CMS Public";
    switch (activeModule) {
      case 'dashboard': return "Vue d'ensemble du Club";
      case 'members': return 'Gestion des Licenciés & Adhésions';
      case 'teams': return 'Équipes & Compositions';
      case 'calendar': return 'Calendrier Sportif & Convocations';
      case 'trainings': return 'Séances d\'Entraînements & Exercices';
      case 'attendance': return 'Pointage des Présences';
      case 'match_analytics': return 'Feuilles de Match & Statistiques';
      case 'medical': return 'Suivi Médical & Protocoles Kiné';
      case 'academy': return 'Académie & Suivi Scolaire';
      case 'recruitment': return 'Cellule Recrutement & Scouting';
      case 'staff': return 'Organigramme & Fiches de Poste';
      case 'contracts': return 'Contrats RH & Prestations';
      case 'leaves': return 'Congés & Remplacements';
      case 'meetings': return 'Relevés de Décisions & AG';
      case 'documents': return 'Coffre-fort Documentaire';
      case 'inventory': return 'Inventaire Matériel & Équipements';
      case 'vehicles': return 'Gestion Flotte Minibus';
      case 'procurement': return 'Achats & Bons de Commande';
      case 'finance': return 'Grand Livre & Comptabilité FEC';
      case 'invoices': return 'Facturation & Devis';
      case 'pos': return 'Caisse Buvette & Billetterie Match';
      case 'sponsorship': return 'Sponsors & Mécénat Cerfa';
      case 'expenses': return 'Notes de Frais Staff';
      case 'ticketing': return 'Billetterie Événements';
      case 'shop': return 'Boutique du Club';
      case 'messaging': return 'Messagerie Instantanée';
      case 'marketing': return 'Campagnes SMS & Emailing';
      case 'reporting': return 'Rapports Direction & KPIs';
      default: return 'Tableau de bord';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      {/* Côté Gauche : Menu Mobile & Titre & Club Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 text-slate-400 hover:text-white lg:hidden rounded-lg hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Bouton de sélection du Club Multi-Tenant */}
        <button
          onClick={openClubSwitchModal}
          className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-xl transition-all group"
          title="Changer de club"
        >
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] text-white shadow-sm"
            style={{ backgroundColor: activeClub?.primary_color || '#1e40af' }}
          >
            {activeClub?.short_name?.[0] || 'C'}
          </div>
          <span className="font-bold text-xs text-white max-w-[130px] truncate">
            {activeClub?.name || 'AS Montrouge'}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
        </button>

        <div className="h-5 w-px bg-slate-800 hidden sm:block" />

        <h1 className="text-sm font-bold text-white truncate max-w-[180px] sm:max-w-none">
          {getModuleTitle()}
        </h1>
      </div>

      {/* Côté Droit : Actions & Profil Utilisateur */}
      <div className="flex items-center gap-2">
        {/* Recherche Globale */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-xl transition-all"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">Rechercher...</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 rounded">
            Ctrl+K
          </kbd>
        </button>

        {/* Action Rapide */}
        <button
          onClick={onOpenQuickAction}
          className="p-2 text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20 transition-all"
          title="Création rapide"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <Bell className="w-4 h-4" />
          {totalAlerts > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
          )}
        </button>

        <div className="h-5 w-px bg-slate-800 mx-1" />

        {/* Profil & Menu Utilisateur / Authentification */}
        {isAuthenticated && currentUser ? (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800 transition-colors group"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-md">
                  {currentUser.first_name?.[0]}{currentUser.last_name?.[0]}
                </div>
                {currentUser.is_2fa_enabled && (
                  <span className="absolute -bottom-1 -right-1 p-0.5 bg-emerald-950 border border-emerald-500 rounded-full text-[8px]" title="2FA Activée">
                    🛡️
                  </span>
                )}
              </div>

              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-white leading-tight">
                  {currentUser.first_name} {currentUser.last_name?.[0]}.
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                    {activeRole === 'SUPER_ADMIN' ? 'Président / Admin' : activeRole}
                  </span>
                </div>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
            </button>

            {/* Dropdown Menu Utilisateur */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-fadeIn">
                <div className="px-4 py-2 border-b border-slate-800">
                  <div className="text-xs font-bold text-white">{currentUser.full_name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                  {currentUser.is_2fa_enabled && (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full">
                      <ShieldCheck className="w-2.5 h-2.5" /> 2FA Activée
                    </span>
                  )}
                </div>

                <button
                  onClick={() => { setIsUserMenuOpen(false); openProfileModal(); }}
                  className="w-full px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                >
                  <User className="w-4 h-4 text-blue-400" />
                  Mon Profil & 2FA
                </button>

                <button
                  onClick={() => { setIsUserMenuOpen(false); openRoleModal(); }}
                  className="w-full px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  Rôles & Permissions RBAC
                </button>

                <button
                  onClick={() => { setIsUserMenuOpen(false); openClubSwitchModal(); }}
                  className="w-full px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                >
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  Basculer de club
                </button>

                <div className="border-t border-slate-800 my-1" />

                <button
                  onClick={() => { setIsUserMenuOpen(false); logout(); }}
                  className="w-full px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/30 flex items-center gap-2.5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => openAuthModal('login')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-all"
          >
            <LogIn className="w-3.5 h-3.5" />
            Se connecter
          </button>
        )}
      </div>
    </header>
  );
};
