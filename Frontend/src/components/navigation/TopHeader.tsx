import React, { useState } from 'react';
import {
  Menu,
  Search,
  Plus,
  Bell,
  Globe,
  CheckCircle,
  ChevronDown,
  SlidersHorizontal,
  Trophy,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { ClubRole, SportType } from '../../types';
import { SPORT_PRESETS } from '../../data/sportPresets';

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
  isSidebarCollapsed,
}) => {
  const {
    activeModule,
    currentRole,
    setCurrentRole,
    currentSport,
    setCurrentSport,
    currentSportConfig,
    isPublicSiteOpen,
    setIsPublicSiteOpen,
    members,
    medicalRecords,
    invoices,
    showToast,
  } = useClub();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isSportDropdownOpen, setIsSportDropdownOpen] = useState(false);

  const sportsList: { id: SportType; name: string; badge: string; desc: string }[] = [
    { id: 'volleyball', name: 'Volleyball', badge: '🏐', desc: 'VolleyPro Élite' },
    { id: 'football', name: 'Football (Soccer)', badge: '⚽', desc: 'FC Élite Métropole' },
    { id: 'basketball', name: 'Basketball', badge: '🏀', desc: 'Hoops Club Pro' },
    { id: 'handball', name: 'Handball', badge: '🤾', desc: 'Handball Club Excellence' },
    { id: 'rugby', name: 'Rugby à XV / 7s', badge: '🏉', desc: 'Stade Rugby Union' },
    { id: 'tennis', name: 'Tennis & Padel', badge: '🎾', desc: 'Tennis & Padel Pro' },
  ];

  const rolesList: { role: ClubRole; label: string; badge: string; color: string }[] = [
    { role: 'admin', label: 'Président / Admin', badge: 'Accès Total', color: 'bg-blue-100 text-blue-700' },
    { role: 'sport_director', label: 'Directeur Sportif', badge: 'Sport & Équipes', color: 'bg-indigo-100 text-indigo-700' },
    { role: 'treasurer', label: 'Trésorier / Finances', badge: 'Comptabilité', color: 'bg-emerald-100 text-emerald-700' },
    { role: 'secretary', label: 'Secrétaire Général', badge: 'Licences & AG', color: 'bg-amber-100 text-amber-700' },
    { role: 'medical', label: 'Staff Médical / Kiné', badge: 'Santé & Soins', color: 'bg-rose-100 text-rose-700' },
    { role: 'logistics', label: 'Intendant Matériel', badge: 'Stocks & Flotte', color: 'bg-cyan-100 text-cyan-700' },
    { role: 'volunteer', label: 'Bénévole Buvette', badge: 'Caisse Match', color: 'bg-purple-100 text-purple-700' },
  ];

  // Alerts counter
  const totalAlerts =
    members.filter(m => !m.medicalCertValid || m.licenseStatus === 'Expirée').length +
    medicalRecords.filter(m => m.status === 'Indisponible').length +
    invoices.filter(i => i.status === 'En retard').length;

  const currentRoleObj = rolesList.find(r => r.role === currentRole) || rolesList[0];

  const getModuleTitle = () => {
    switch (activeModule) {
      case 'dashboard':
        return "Vue d'ensemble du Club";
      case 'members':
        return 'Gestion des Licenciés & Adhésions';
      case 'teams':
        return 'Équipes & Compositions';
      case 'calendar':
        return 'Calendrier Sportif & Convocations';
      case 'trainings':
        return 'Séances d\'Entraînements & Exercices';
      case 'attendance':
        return 'Pointage des Présences';
      case 'match_analytics':
        return 'Feuilles de Match & Statistiques';
      case 'medical':
        return 'Suivi Médical & Protocoles Kiné';
      case 'academy':
        return 'Académie & Suivi Scolaire';
      case 'recruitment':
        return 'Cellule Recrutement & Scouting';
      case 'staff':
        return 'Organigramme & Fiches de Poste';
      case 'contracts':
        return 'Contrats de Travail & Salaires';
      case 'leaves':
        return 'Gestion des Congés & Remplacements';
      case 'meetings':
        return 'Assemblées Générales & Votes';
      case 'documents':
        return 'GED & Documents Officiels';
      case 'inventory':
        return 'Stocks & Équipements';
      case 'vehicles':
        return 'Parc Minibus & Déplacements';
      case 'procurement':
        return 'Bons de Commande & Fournisseurs';
      case 'finance':
        return 'Comptabilité & Grand Livre';
      case 'invoices':
        return 'Facturation & Devis Sponsors';
      case 'pos':
        return 'Caisse Buvette & Point de Vente';
      case 'sponsorship':
        return 'Partenariats & Mécénat Cerfa';
      case 'expenses':
        return 'Notes de Frais & Kilomètres';
      case 'ticketing':
        return 'Tournois & Billetterie QR';
      case 'shop':
        return 'Boutique Officielle du Club';
      case 'messaging':
        return 'Messagerie Interne & Canaux';
      case 'marketing':
        return 'Campagnes & Newsletters';
      case 'website_cms':
        return 'Site Public & CMS Actualités';
      case 'executive_reporting':
        return 'Rapports Stratégiques Dirigeants';
      case 'ai_assistant':
        return 'Assistant Club & IA Stratégique';
      default:
        return 'Administration du Club';
    }
  };

  return (
    <header
      id="top-header"
      className={`sticky top-0 z-30 bg-white border-b border-slate-200 transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
      }`}
    >
      <div className="h-16 flex items-center justify-between px-4 sm:px-8">
        {/* Left: Mobile hamburger + Title & Subtitle */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-800 truncate">{getModuleTitle()}</h1>
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                {currentSportConfig.badge} {currentSportConfig.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block truncate">
              {currentSportConfig.clubName} — Saison 2024 / 2025
            </p>
          </div>
        </div>

        {/* Right: Sport Selector, Search, Role, Notifications & New Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Sport Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              id="sport-selector-btn"
              onClick={() => {
                setIsSportDropdownOpen(!isSportDropdownOpen);
                setIsRoleDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-800 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 shadow-2xs transition-all cursor-pointer"
            >
              <span className="text-sm">{currentSportConfig.badge}</span>
              <span className="font-semibold text-amber-950 hidden md:inline">{currentSportConfig.name}</span>
              <ChevronDown className="w-3 h-3 text-amber-700" />
            </button>

            {isSportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Choisir la Discipline Sportive
                </div>
                <div className="space-y-1">
                  {sportsList.map(s => {
                    const isSelected = currentSport === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setCurrentSport(s.id);
                          setIsSportDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{s.badge}</span>
                          <div>
                            <div className="font-bold">{s.name}</div>
                            <div className="text-[10px] text-slate-400 font-medium">{s.desc}</div>
                          </div>
                        </div>
                        {isSelected && <CheckCircle className="w-4 h-4 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick search button */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Rechercher...</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-white rounded border border-slate-200 shadow-2xs">
              Ctrl K
            </kbd>
          </button>

          {/* Role selector dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsRoleDropdownOpen(!isRoleDropdownOpen);
                setIsSportDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">{currentRoleObj.label.split('/')[0]}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase">
                  Profil & Permissions
                </div>
                {rolesList.map(r => (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => {
                      setCurrentRole(r.role);
                      setIsRoleDropdownOpen(false);
                      showToast(`Vue activée : ${r.label}`);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      currentRole === r.role ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-700'
                    }`}
                  >
                    <span>{r.label}</span>
                    {currentRole === r.role && <CheckCircle className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Public website portal preview */}
          <button
            type="button"
            onClick={() => setIsPublicSiteOpen(!isPublicSiteOpen)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isPublicSiteOpen ? 'Fermer Public' : 'Portail Public'}</span>
          </button>

          {/* Notification bell with badge */}
          <div className="relative">
            {totalAlerts > 0 && (
              <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
            )}
            <button
              type="button"
              id="btn-notifications"
              onClick={onOpenNotifications}
              className="w-9 h-9 flex items-center justify-center text-slate-500 border border-slate-200 rounded-full hover:bg-slate-50 cursor-pointer transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>

          {/* "+ Nouveau" Quick Action Trigger */}
          <button
            type="button"
            id="btn-quick-action"
            onClick={onOpenQuickAction}
            className="bg-blue-600 text-white px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-blue-700 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau</span>
          </button>
        </div>
      </div>
    </header>
  );
};
