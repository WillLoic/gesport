import React, { useState, useEffect } from 'react';
import { ClubProvider, useClub } from './context/ClubContext';
import { AuthProvider } from './context/AuthContext';
import { Sidebar } from './components/navigation/Sidebar';
import { TopHeader } from './components/navigation/TopHeader';

// Modal and Drawer Components
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { QuickActionModal } from './components/modals/QuickActionModal';
import { NotificationDrawer } from './components/modals/NotificationDrawer';

// Auth IAM Modals
import { AuthModal } from './components/auth/AuthModal';
import { UserProfileModal } from './components/auth/UserProfileModal';
import { ClubSwitchModal } from './components/auth/ClubSwitchModal';
import { RoleManagementModal } from './components/auth/RoleManagementModal';

// Module Components
import { DashboardView } from './components/modules/DashboardView';
import { MembersView } from './components/modules/MembersView';
import { TeamsView } from './components/modules/TeamsView';
import { CalendarView } from './components/modules/CalendarView';
import { TrainingsView } from './components/modules/TrainingsView';
import { AttendanceView } from './components/modules/AttendanceView';
import { MatchAnalyticsView } from './components/modules/MatchAnalyticsView';
import { MedicalView } from './components/modules/MedicalView';
import { AcademyView } from './components/modules/AcademyView';
import { RecruitmentView } from './components/modules/RecruitmentView';
import { StaffHierarchyView } from './components/modules/StaffHierarchyView';
import { StaffContractsView } from './components/modules/StaffContractsView';
import { StaffLeavesView } from './components/modules/StaffLeavesView';
import { ClubMeetingsView } from './components/modules/ClubMeetingsView';
import { DocumentManagementView } from './components/modules/DocumentManagementView';
import { InventoryView } from './components/modules/InventoryView';
import { VehicleFleetView } from './components/modules/VehicleFleetView';
import { ProcurementView } from './components/modules/ProcurementView';
import { FinanceLedgerView } from './components/modules/FinanceLedgerView';
import { InvoicingView } from './components/modules/InvoicingView';
import { PosCashRegisterView } from './components/modules/PosCashRegisterView';
import { SponsorshipView } from './components/modules/SponsorshipView';
import { ExpenseClaimsView } from './components/modules/ExpenseClaimsView';
import { CompetitionsTicketingView } from './components/modules/CompetitionsTicketingView';
import { ShopMerchandisingView } from './components/modules/ShopMerchandisingView';
import { InternalMessagingView } from './components/modules/InternalMessagingView';
import { MarketingCampaignsView } from './components/modules/MarketingCampaignsView';
import { ClubWebsiteCMSView } from './components/modules/ClubWebsiteCMSView';
import { ExecutiveReportingView } from './components/modules/ExecutiveReportingView';

const MainAppContent: React.FC = () => {
  const { activeModule, toastMessage, isPublicSiteOpen } = useClub();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isQuickActionModalOpen, setIsQuickActionModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  // Keyboard shortcut for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderActiveModule = () => {
    if (isPublicSiteOpen) {
      return <ClubWebsiteCMSView />;
    }

    switch (activeModule) {
      case 'dashboard':
        return <DashboardView />;
      case 'members':
        return <MembersView />;
      case 'teams':
        return <TeamsView />;
      case 'calendar':
        return <CalendarView />;
      case 'trainings':
        return <TrainingsView />;
      case 'attendance':
        return <AttendanceView />;
      case 'match_analytics':
        return <MatchAnalyticsView />;
      case 'medical':
        return <MedicalView />;
      case 'academy':
        return <AcademyView />;
      case 'recruitment':
        return <RecruitmentView />;
      case 'staff':
        return <StaffHierarchyView />;
      case 'contracts':
        return <StaffContractsView />;
      case 'leaves':
        return <StaffLeavesView />;
      case 'meetings':
        return <ClubMeetingsView />;
      case 'documents':
        return <DocumentManagementView />;
      case 'inventory':
        return <InventoryView />;
      case 'vehicles':
        return <VehicleFleetView />;
      case 'procurement':
        return <ProcurementView />;
      case 'finance':
        return <FinanceLedgerView />;
      case 'invoices':
        return <InvoicingView />;
      case 'pos':
        return <PosCashRegisterView />;
      case 'sponsorship':
        return <SponsorshipView />;
      case 'expenses':
        return <ExpenseClaimsView />;
      case 'ticketing':
        return <CompetitionsTicketingView />;
      case 'shop':
        return <ShopMerchandisingView />;
      case 'messaging':
        return <InternalMessagingView />;
      case 'marketing':
        return <MarketingCampaignsView />;
      case 'reporting':
        return <ExecutiveReportingView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white flex">
      {/* Navigation de gauche */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main layout container */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}
      >
        {/* Top Header */}
        <TopHeader
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          onOpenQuickAction={() => setIsQuickActionModalOpen(true)}
          onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-[1920px] mx-auto w-full">
          {renderActiveModule()}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />

      <QuickActionModal
        isOpen={isQuickActionModalOpen}
        onClose={() => setIsQuickActionModalOpen(false)}
      />

      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
      />

      {/* Modales Auth & IAM */}
      <AuthModal />
      <UserProfileModal />
      <ClubSwitchModal />
      <RoleManagementModal />

      {/* Global Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-12 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ClubProvider>
        <MainAppContent />
      </ClubProvider>
    </AuthProvider>
  );
}
