import React from 'react';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Calendar,
  Dumbbell,
  ClipboardCheck,
  BarChart3,
  HeartPulse,
  GraduationCap,
  UserCheck,
  Briefcase,
  FileSpreadsheet,
  CalendarOff,
  Vote,
  FolderLock,
  Boxes,
  Truck,
  ShoppingBag,
  Store,
  Receipt,
  FileText,
  BadgeDollarSign,
  WalletCards,
  Ticket,
  Shirt,
  MessageSquare,
  Mail,
  Globe,
  Sparkles,
  PieChart,
  ChevronRight,
  ChevronDown,
  X,
  Shield,
  Activity,
} from 'lucide-react';
import { useClub, ActiveModule } from '../../context/ClubContext';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

interface NavGroup {
  id: string;
  label: string;
  items: {
    id: ActiveModule;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed,
}) => {
  const {
    activeModule,
    setActiveModule,
    currentSportConfig,
    members,
    medicalRecords,
    invoices,
    purchaseOrders,
    channels,
  } = useClub();

  // Dynamic alert counts
  const expiredMembersCount = members.filter(m => m.licenseStatus === 'Expirée' || m.licenseStatus === 'En attente').length;
  const injuredCount = medicalRecords.filter(m => m.status === 'Indisponible' || m.status === 'Réathlétisation').length;
  const overdueInvoicesCount = invoices.filter(i => i.status === 'En retard').length;
  const pendingOrdersCount = purchaseOrders.filter(p => p.status === 'En attente validation').length;
  const unreadMessages = channels.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({
    overview: true,
    sport: true,
    admin: true,
    facilities: true,
    finance: true,
    events: true,
    analytics: true,
  });

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const navGroups: NavGroup[] = [
    {
      id: 'overview',
      label: 'Terrain & Suivi',
      items: [
        { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
        { id: 'members', label: 'Gestion des Licenciés', icon: Users, badge: expiredMembersCount > 0 ? expiredMembersCount : undefined, badgeColor: 'bg-amber-500 text-white' },
        { id: 'teams', label: 'Équipes & Compositions', icon: Shield },
        { id: 'calendar', label: 'Calendrier Sportif', icon: Calendar },
        { id: 'trainings', label: 'Entraînements & Exercices', icon: Dumbbell },
        { id: 'attendance', label: 'Pointage & Présences', icon: ClipboardCheck },
        { id: 'match_analytics', label: 'Statistiques & Matchs', icon: BarChart3 },
        { id: 'medical', label: 'Suivi Médical & Kiné', icon: HeartPulse, badge: injuredCount > 0 ? injuredCount : undefined, badgeColor: 'bg-rose-500 text-white' },
        { id: 'academy', label: 'Académie & Formation', icon: GraduationCap },
        { id: 'recruitment', label: 'Recrutement & Scouting', icon: UserCheck },
      ],
    },
    {
      id: 'facilities',
      label: 'Ressources & Stocks',
      items: [
        { id: 'inventory', label: 'Stocks & Équipements', icon: Boxes },
        { id: 'vehicles', label: 'Parc Automobile & Minibus', icon: Truck },
        { id: 'procurement', label: 'Achats & Fournisseurs', icon: ShoppingBag, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined, badgeColor: 'bg-blue-600 text-white' },
        { id: 'pos', label: 'Caisse Buvette (POS)', icon: Store },
      ],
    },
    {
      id: 'admin',
      label: 'Gouvernance & RH',
      items: [
        { id: 'staff', label: 'Organigramme & Staff', icon: Briefcase },
        { id: 'contracts', label: 'Contrats & Salaires RH', icon: FileSpreadsheet },
        { id: 'leaves', label: 'Congés & Remplacements', icon: CalendarOff },
        { id: 'meetings', label: 'Réunions & Assemblées AG', icon: Vote },
        { id: 'documents', label: 'GED Documents Officiels', icon: FolderLock },
      ],
    },
    {
      id: 'finance',
      label: 'Comptabilité & Régie',
      items: [
        { id: 'finance', label: 'Grand Livre & Trésorerie', icon: Receipt },
        { id: 'invoices', label: 'Facturation & Devis', icon: FileText, badge: overdueInvoicesCount > 0 ? overdueInvoicesCount : undefined, badgeColor: 'bg-red-500 text-white' },
        { id: 'sponsorship', label: 'Sponsoring & Mécénat', icon: BadgeDollarSign },
        { id: 'expenses', label: 'Notes de Frais', icon: WalletCards },
      ],
    },
    {
      id: 'events',
      label: 'Marketing & Supporter',
      items: [
        { id: 'ticketing', label: 'Billetterie & Tournois', icon: Ticket },
        { id: 'shop', label: 'Boutique du Club', icon: Shirt },
        { id: 'messaging', label: 'Messagerie Interne', icon: MessageSquare, badge: unreadMessages > 0 ? unreadMessages : undefined, badgeColor: 'bg-blue-500 text-white' },
        { id: 'marketing', label: 'Campagnes & Emailing', icon: Mail },
        { id: 'website_cms', label: 'Site Public & Actualités', icon: Globe },
      ],
    },
    {
      id: 'analytics',
      label: 'Audit & Intelligence',
      items: [
        { id: 'executive_reporting', label: 'Rapports Stratégiques', icon: PieChart },
        { id: 'ai_assistant', label: 'Assistant Club & IA', icon: Sparkles, badge: 'IA PRO', badgeColor: 'bg-blue-600 text-white' },
      ],
    },
  ];

  const handleSelectModule = (id: ActiveModule) => {
    setActiveModule(id);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar container with Professional Polish styling */}
      <aside
        id="main-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 select-none
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        `}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 bg-slate-950">
          <div
            className="flex items-center gap-3 overflow-hidden cursor-pointer"
            onClick={() => handleSelectModule('dashboard')}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-xs shrink-0 text-base">
              {currentSportConfig.badge}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="text-base font-bold text-white tracking-tight font-display truncate block">
                  {currentSportConfig.shortName}
                </span>
                <p className="text-[10px] text-blue-400 tracking-wider uppercase font-bold">
                  {currentSportConfig.name}
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Groups */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {navGroups.map(group => (
            <div key={group.id}>
              {!isCollapsed && (
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    {group.label}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    {openGroups[group.id] ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}

              {(openGroups[group.id] || isCollapsed) && (
                <ul className="space-y-1">
                  {group.items.map(item => {
                    const Icon = item.icon;
                    const isActive = activeModule === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          id={`nav-item-${item.id}`}
                          type="button"
                          onClick={() => handleSelectModule(item.id)}
                          title={isCollapsed ? item.label : undefined}
                          className={`w-full flex items-center gap-2.5 p-2 rounded-md font-medium text-sm transition-colors cursor-pointer text-left ${
                            isActive
                              ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                              : 'hover:bg-slate-800 text-slate-300'
                          } ${isCollapsed ? 'justify-center' : ''}`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />

                          {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}

                          {item.badge !== undefined && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                                item.badgeColor || 'bg-blue-600 text-white'
                              } ${isCollapsed ? 'absolute -top-1 -right-1 text-[9px]' : ''}`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
        </nav>

        {/* Footer User Profile Card */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg border border-slate-800/80">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                JA
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">Jean Admin</p>
                <p className="text-[10px] text-slate-400 truncate">Directeur Sportif</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="hidden lg:flex p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700"
                title="Réduire le menu"
              >
                <ChevronRight className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="w-full flex justify-center p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              title="Agrandir le menu"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
