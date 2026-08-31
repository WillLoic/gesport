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
  PieChart,
  ChevronRight,
  X,
  Lock,
} from 'lucide-react';
import { useClub, ActiveModule } from '../../context/ClubContext';
import { useAuth, RoleCode } from '../../context/AuthContext';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

interface NavItem {
  id: ActiveModule;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
  allowedRoles?: RoleCode[];
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
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
  } = useClub();

  const { activeClub, activeRole, hasRole } = useAuth();

  // Dynamic alert counts
  const expiredMembersCount = members.filter(m => m.licenseStatus === 'Expirée' || m.licenseStatus === 'En attente').length;
  const injuredCount = medicalRecords.filter(m => m.status === 'Indisponible' || m.status === 'Réathlétisation').length;
  const overdueInvoicesCount = invoices.filter(i => i.status === 'En retard').length;
  const pendingOrdersCount = purchaseOrders.filter(p => p.status === 'En attente validation').length;

  const navGroups: NavGroup[] = [
    {
      id: 'core',
      label: 'GÉNÉRAL',
      items: [
        { id: 'dashboard', label: "Vue d'ensemble", icon: LayoutDashboard },
      ],
    },
    {
      id: 'sport',
      label: `PÔLE SPORTIF (${currentSportConfig.name.toUpperCase()})`,
      items: [
        { id: 'members', label: 'Adhérents & Licenciés', icon: Users, badge: expiredMembersCount > 0 ? expiredMembersCount : undefined, badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
        { id: 'teams', label: 'Équipes & Effectifs', icon: ShieldAlert },
        { id: 'calendar', label: 'Matchs & Convocations', icon: Calendar },
        { id: 'trainings', label: 'Entraînements & Schémas', icon: Dumbbell },
        { id: 'attendance', label: 'Présences & Pointage', icon: ClipboardCheck },
        { id: 'match_analytics', label: 'Statistiques & Matchs', icon: BarChart3 },
        { id: 'medical', label: 'Suivi Médical & Kiné', icon: HeartPulse, badge: injuredCount > 0 ? `${injuredCount} blessés` : undefined, badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30', allowedRoles: ['SUPER_ADMIN', 'CLUB_ADMIN', 'COACH', 'MEDICAL_STAFF'] },
        { id: 'academy', label: 'Académie & Formation', icon: GraduationCap },
        { id: 'recruitment', label: 'Cellule Recrutement', icon: UserCheck, allowedRoles: ['SUPER_ADMIN', 'CLUB_ADMIN', 'COACH'] },
      ],
    },
    {
      id: 'hr_governance',
      label: 'RH & GOUVERNANCE',
      items: [
        { id: 'staff', label: 'Organigramme Staff', icon: Briefcase, allowedRoles: ['SUPER_ADMIN', 'CLUB_ADMIN'] },
        { id: 'contracts', label: 'Contrats & Fiches RH', icon: FileSpreadsheet, allowedRoles: ['SUPER_ADMIN', 'CLUB_ADMIN'] },
        { id: 'leaves', label: 'Congés & Remplaçants', icon: CalendarOff, allowedRoles: ['SUPER_ADMIN', 'CLUB_ADMIN'] },
        { id: 'meetings', label: 'Assemblées & Procès-Verbaux', icon: Vote, allowedRoles: ['SUPER_ADMIN', 'CLUB_ADMIN'] },
        { id: 'documents', label: 'Coffre-fort Documents', icon: FolderLock, allowedRoles: ['SUPER_ADMIN', 'CLUB_ADMIN'] },
      ],
    },
    {
      id: 'logistics',
      label: 'LOGISTIQUE & OPÉRATIONS',
      items: [
        { id: 'inventory', label: 'Inventaire Matériel', icon: Boxes, allowedRoles: ['SUPER_ADMIN', 'CLUB_ADMIN', 'LOGISTICS', 'COACH'] },
        { id: 'vehicles', label: 'Flotte Minibus & Résa', icon: Truck, allowedRoles: ['SUPER_ADMIN', 'CLUB_ADMIN', 'LOGISTICS', 'COACH'] },
        { id: 'procurement', label: 'Achats & Commande', icon: ShoppingBag, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined, badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30', allowedRoles: ['SUPER_ADMIN', 'CLUB_ADMIN', 'LOGISTICS', 'TREASURER'] },
      ],
    },
    {
      id: 'finance',
      label: 'FINANCES & SPONSORING',
      items: [
        { id: 'finance', label: 'Grand Livre Comptable', icon: Receipt, allowedRoles: ['SUPER_ADMIN', 'CLUB_ADMIN', 'TREASURER'] },
        { id: 'invoices', label: 'Factures & Cotisations', icon: FileText, badge: overdueInvoicesCount > 0 ? `${overdueInvoicesCount} retard` : undefined, badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30', allowedRoles: ['SUPER_ADMIN', 'CLUB_ADMIN', 'TREASURER'] },
        { id: 'pos', label: 'Caisse Buvette & Billets', icon: Store, allowedRoles: ['SUPER_ADMIN', 'CLUB_ADMIN', 'TREASURER'] },
        { id: 'sponsorship', label: 'Sponsors & Reçus Cerfa', icon: BadgeDollarSign, allowedRoles: ['SUPER_ADMIN', 'CLUB_ADMIN', 'TREASURER'] },
        { id: 'expenses', label: 'Notes de Frais Staff', icon: WalletCards, allowedRoles: ['SUPER_ADMIN', 'CLUB_ADMIN', 'TREASURER'] },
      ],
    },
    {
      id: 'commercial',
      label: 'COMMERCE & COMMUNICATION',
      items: [
        { id: 'ticketing', label: 'Billetterie Matchs & Stages', icon: Ticket },
        { id: 'shop', label: 'Boutique Maillots & Flocage', icon: Shirt },
        { id: 'messaging', label: 'Messagerie Instantanée', icon: MessageSquare },
        { id: 'marketing', label: 'Campagnes SMS & Emailing', icon: Mail, allowedRoles: ['SUPER_ADMIN', 'CLUB_ADMIN'] },
        { id: 'reporting', label: 'Rapports & Indicateurs KPIs', icon: PieChart, allowedRoles: ['SUPER_ADMIN', 'CLUB_ADMIN'] },
      ],
    },
  ];

  return (
    <>
      {/* Overlay mobile */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden animate-fadeIn"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-72'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* En-tête du Club Multi-Tenant */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-white text-base shadow-lg shrink-0"
              style={{ backgroundColor: activeClub?.primary_color || '#1e40af' }}
            >
              {activeClub?.short_name?.[0] || 'G'}
            </div>

            {!isCollapsed && (
              <div className="truncate">
                <h2 className="font-extrabold text-white text-sm tracking-tight truncate">
                  {activeClub?.name || 'GESPORT'}
                </h2>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-blue-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  Rôle : {activeRole}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation avec filtrage RBAC intelligent */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar">
          {navGroups.map(group => (
            <div key={group.id} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 text-[10px] font-extrabold text-slate-500 tracking-wider uppercase mb-2">
                  {group.label}
                </div>
              )}

              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                const isAllowed = !item.allowedRoles || hasRole(item.allowedRoles);

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (isAllowed) {
                        setActiveModule(item.id);
                        setIsMobileOpen(false);
                      }
                    }}
                    disabled={!isAllowed}
                    title={!isAllowed ? `Accès restreint au rôle ${item.allowedRoles?.join(', ')}` : item.label}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : isAllowed
                        ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                        : 'text-slate-600 opacity-50 cursor-not-allowed bg-slate-950/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : isAllowed ? 'text-slate-400 group-hover:text-blue-400' : 'text-slate-600'}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && (
                      <div className="flex items-center gap-1.5">
                        {!isAllowed ? (
                          <Lock className="w-3.5 h-3.5 text-amber-500/70" />
                        ) : (
                          item.badge && (
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                                item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};
