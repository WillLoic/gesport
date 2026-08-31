import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Member,
  StaffMember,
  Team,
  SportEvent,
  TrainingExercise,
  TrainingSession,
  AttendanceRecord,
  MatchStats,
  MedicalRecord,
  InventoryItem,
  Vehicle,
  PurchaseOrder,
  PosProduct,
  PosOrder,
  DocumentItem,
  ClubMeeting,
  StaffContract,
  LeaveRequest,
  FinancialTransaction,
  Invoice,
  SponsorPartner,
  ExpenseClaim,
  MarketingCampaign,
  NewsArticle,
  ShopProduct,
  TournamentMatch,
  TicketPass,
  TalentCandidate,
  AcademyStudent,
  ChatChannel,
  ChatMessage,
  ClubRole,
  SportType,
  SportPresetConfig,
} from '../types';
import {
  INITIAL_MEMBERS,
  INITIAL_STAFF,
  INITIAL_TEAMS,
  INITIAL_EVENTS,
  INITIAL_EXERCISES,
  INITIAL_TRAININGS,
  INITIAL_ATTENDANCE,
  INITIAL_MATCH_STATS,
  INITIAL_MEDICAL_RECORDS,
  INITIAL_INVENTORY,
  INITIAL_VEHICLES,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_POS_PRODUCTS,
  INITIAL_POS_ORDERS,
  INITIAL_DOCUMENTS,
  INITIAL_MEETINGS,
  INITIAL_CONTRACTS,
  INITIAL_LEAVES,
  INITIAL_FINANCE,
  INITIAL_INVOICES,
  INITIAL_SPONSORS,
  INITIAL_EXPENSES,
  INITIAL_CAMPAIGNS,
  INITIAL_NEWS,
  INITIAL_SHOP_PRODUCTS,
  INITIAL_TOURNAMENTS,
  INITIAL_TICKETS,
  INITIAL_TALENTS,
  INITIAL_ACADEMY,
  INITIAL_CHANNELS,
  INITIAL_MESSAGES,
} from '../data/mockData';
import { SPORT_PRESETS, getTeamsForSport, getExercisesForSport } from '../data/sportPresets';

export type ActiveModule =
  | 'dashboard'
  | 'members'
  | 'teams'
  | 'calendar'
  | 'trainings'
  | 'attendance'
  | 'match_analytics'
  | 'medical'
  | 'academy'
  | 'recruitment'
  | 'staff'
  | 'contracts'
  | 'leaves'
  | 'meetings'
  | 'documents'
  | 'inventory'
  | 'vehicles'
  | 'procurement'
  | 'pos'
  | 'finance'
  | 'invoices'
  | 'sponsorship'
  | 'expenses'
  | 'ticketing'
  | 'shop'
  | 'messaging'
  | 'marketing'
  | 'website_cms'
  | 'executive_reporting'
  | 'ai_assistant';

interface ClubContextType {
  activeModule: ActiveModule;
  setActiveModule: (module: ActiveModule) => void;
  currentRole: ClubRole;
  setCurrentRole: (role: ClubRole) => void;
  currentSeason: string;
  setCurrentSeason: (season: string) => void;
  isPublicSiteOpen: boolean;
  setIsPublicSiteOpen: (open: boolean) => void;

  // Multi-Sport Management
  currentSport: SportType;
  setCurrentSport: (sport: SportType) => void;
  currentSportConfig: SportPresetConfig;

  // Data sets
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  staff: StaffMember[];
  setStaff: React.Dispatch<React.SetStateAction<StaffMember[]>>;
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  events: SportEvent[];
  setEvents: React.Dispatch<React.SetStateAction<SportEvent[]>>;
  exercises: TrainingExercise[];
  setExercises: React.Dispatch<React.SetStateAction<TrainingExercise[]>>;
  trainings: TrainingSession[];
  setTrainings: React.Dispatch<React.SetStateAction<TrainingSession[]>>;
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  matchStats: MatchStats[];
  setMatchStats: React.Dispatch<React.SetStateAction<MatchStats[]>>;
  medicalRecords: MedicalRecord[];
  setMedicalRecords: React.Dispatch<React.SetStateAction<MedicalRecord[]>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  purchaseOrders: PurchaseOrder[];
  setPurchaseOrders: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>;
  posProducts: PosProduct[];
  setPosProducts: React.Dispatch<React.SetStateAction<PosProduct[]>>;
  posOrders: PosOrder[];
  setPosOrders: React.Dispatch<React.SetStateAction<PosOrder[]>>;
  documents: DocumentItem[];
  setDocuments: React.Dispatch<React.SetStateAction<DocumentItem[]>>;
  meetings: ClubMeeting[];
  setMeetings: React.Dispatch<React.SetStateAction<ClubMeeting[]>>;
  contracts: StaffContract[];
  setContracts: React.Dispatch<React.SetStateAction<StaffContract[]>>;
  leaves: LeaveRequest[];
  setLeaves: React.Dispatch<React.SetStateAction<LeaveRequest[]>>;
  finances: FinancialTransaction[];
  setFinances: React.Dispatch<React.SetStateAction<FinancialTransaction[]>>;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  sponsors: SponsorPartner[];
  setSponsors: React.Dispatch<React.SetStateAction<SponsorPartner[]>>;
  expenses: ExpenseClaim[];
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseClaim[]>>;
  campaigns: MarketingCampaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<MarketingCampaign[]>>;
  news: NewsArticle[];
  setNews: React.Dispatch<React.SetStateAction<NewsArticle[]>>;
  shopProducts: ShopProduct[];
  setShopProducts: React.Dispatch<React.SetStateAction<ShopProduct[]>>;
  tournaments: TournamentMatch[];
  setTournaments: React.Dispatch<React.SetStateAction<TournamentMatch[]>>;
  tickets: TicketPass[];
  setTickets: React.Dispatch<React.SetStateAction<TicketPass[]>>;
  talents: TalentCandidate[];
  setTalents: React.Dispatch<React.SetStateAction<TalentCandidate[]>>;
  academy: AcademyStudent[];
  setAcademy: React.Dispatch<React.SetStateAction<AcademyStudent[]>>;
  channels: ChatChannel[];
  setChannels: React.Dispatch<React.SetStateAction<ChatChannel[]>>;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;

  // Toast / notification helper
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

export const ClubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  const [currentRole, setCurrentRole] = useState<ClubRole>('admin');
  const [currentSeason, setCurrentSeason] = useState<string>('2024-2025 (En cours)');
  const [isPublicSiteOpen, setIsPublicSiteOpen] = useState<boolean>(false);

  // Current sport state
  const [currentSport, setCurrentSportState] = useState<SportType>(() => {
    const saved = localStorage.getItem('sportflow_current_sport');
    return (saved as SportType) || 'volleyball';
  });

  const currentSportConfig = SPORT_PRESETS[currentSport] || SPORT_PRESETS.volleyball;

  // States initialized from mockData with localStorage caching
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('sportflow_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('sportflow_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('sportflow_teams');
    return saved ? JSON.parse(saved) : INITIAL_TEAMS;
  });

  const [events, setEvents] = useState<SportEvent[]>(() => {
    const saved = localStorage.getItem('sportflow_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [exercises, setExercises] = useState<TrainingExercise[]>(() => {
    const savedSport = (localStorage.getItem('sportflow_current_sport') as SportType) || 'volleyball';
    return getExercisesForSport(savedSport);
  });

  const [trainings, setTrainings] = useState<TrainingSession[]>(() => {
    const saved = localStorage.getItem('sportflow_trainings');
    return saved ? JSON.parse(saved) : INITIAL_TRAININGS;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('sportflow_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [matchStats, setMatchStats] = useState<MatchStats[]>(() => {
    const saved = localStorage.getItem('sportflow_match_stats');
    return saved ? JSON.parse(saved) : INITIAL_MATCH_STATS;
  });

  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(() => {
    const saved = localStorage.getItem('sportflow_medical');
    return saved ? JSON.parse(saved) : INITIAL_MEDICAL_RECORDS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('sportflow_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('sportflow_vehicles');
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('sportflow_purchases');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
  });

  const [posProducts, setPosProducts] = useState<PosProduct[]>(() => {
    const saved = localStorage.getItem('sportflow_pos_products');
    return saved ? JSON.parse(saved) : INITIAL_POS_PRODUCTS;
  });

  const [posOrders, setPosOrders] = useState<PosOrder[]>(() => {
    const saved = localStorage.getItem('sportflow_pos_orders');
    return saved ? JSON.parse(saved) : INITIAL_POS_ORDERS;
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem('sportflow_docs');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [meetings, setMeetings] = useState<ClubMeeting[]>(() => {
    const saved = localStorage.getItem('sportflow_meetings');
    return saved ? JSON.parse(saved) : INITIAL_MEETINGS;
  });

  const [contracts, setContracts] = useState<StaffContract[]>(() => {
    const saved = localStorage.getItem('sportflow_contracts');
    return saved ? JSON.parse(saved) : INITIAL_CONTRACTS;
  });

  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('sportflow_leaves');
    return saved ? JSON.parse(saved) : INITIAL_LEAVES;
  });

  const [finances, setFinances] = useState<FinancialTransaction[]>(() => {
    const saved = localStorage.getItem('sportflow_finances');
    return saved ? JSON.parse(saved) : INITIAL_FINANCE;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('sportflow_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [sponsors, setSponsors] = useState<SponsorPartner[]>(() => {
    const saved = localStorage.getItem('sportflow_sponsors');
    return saved ? JSON.parse(saved) : INITIAL_SPONSORS;
  });

  const [expenses, setExpenses] = useState<ExpenseClaim[]>(() => {
    const saved = localStorage.getItem('sportflow_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(() => {
    const saved = localStorage.getItem('sportflow_campaigns');
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });

  const [news, setNews] = useState<NewsArticle[]>(() => {
    const saved = localStorage.getItem('sportflow_news');
    return saved ? JSON.parse(saved) : INITIAL_NEWS;
  });

  const [shopProducts, setShopProducts] = useState<ShopProduct[]>(() => {
    const saved = localStorage.getItem('sportflow_shop');
    return saved ? JSON.parse(saved) : INITIAL_SHOP_PRODUCTS;
  });

  const [tournaments, setTournaments] = useState<TournamentMatch[]>(() => {
    const saved = localStorage.getItem('sportflow_tournaments');
    return saved ? JSON.parse(saved) : INITIAL_TOURNAMENTS;
  });

  const [tickets, setTickets] = useState<TicketPass[]>(() => {
    const saved = localStorage.getItem('sportflow_tickets');
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });

  const [talents, setTalents] = useState<TalentCandidate[]>(() => {
    const saved = localStorage.getItem('sportflow_talents');
    return saved ? JSON.parse(saved) : INITIAL_TALENTS;
  });

  const [academy, setAcademy] = useState<AcademyStudent[]>(() => {
    const saved = localStorage.getItem('sportflow_academy');
    return saved ? JSON.parse(saved) : INITIAL_ACADEMY;
  });

  const [channels, setChannels] = useState<ChatChannel[]>(() => {
    const saved = localStorage.getItem('sportflow_channels');
    return saved ? JSON.parse(saved) : INITIAL_CHANNELS;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('sportflow_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Multi-Sport Switcher logic
  const setCurrentSport = (sport: SportType) => {
    setCurrentSportState(sport);
    localStorage.setItem('sportflow_current_sport', sport);
    const newConfig = SPORT_PRESETS[sport] || SPORT_PRESETS.volleyball;
    const newSportTeams = getTeamsForSport(sport);
    const newSportExercises = getExercisesForSport(sport);
    setTeams(newSportTeams);
    setExercises(newSportExercises);

    // Update members to match sport positions and new teams
    setMembers(prev =>
      prev.map((m, idx) => ({
        ...m,
        position: newConfig.positions[idx % newConfig.positions.length] || newConfig.positions[0],
        teamName: newSportTeams[idx % newSportTeams.length]?.name || newSportTeams[0]?.name || m.teamName,
      }))
    );

    // Update trainings with relevant team names and sport drills
    setTrainings(prev =>
      prev.map((t, idx) => {
        const assignedTeam = newSportTeams[idx % newSportTeams.length] || newSportTeams[0];
        return {
          ...t,
          teamId: assignedTeam ? assignedTeam.id : 't1',
          teamName: assignedTeam ? assignedTeam.name : 'Équipe 1',
          theme: newSportExercises[idx % newSportExercises.length]?.title || t.theme,
          exercises: newSportExercises.slice(0, 3),
        };
      })
    );

    showToast(`Discipline changée : ${newConfig.badge} ${newConfig.name} - Écosystème, Exercices & Terrains adaptés !`);
  };

  return (
    <ClubContext.Provider
      value={{
        activeModule,
        setActiveModule,
        currentRole,
        setCurrentRole,
        currentSeason,
        setCurrentSeason,
        isPublicSiteOpen,
        setIsPublicSiteOpen,
        currentSport,
        setCurrentSport,
        currentSportConfig,
        members,
        setMembers,
        staff,
        setStaff,
        teams,
        setTeams,
        events,
        setEvents,
        exercises,
        setExercises,
        trainings,
        setTrainings,
        attendance,
        setAttendance,
        matchStats,
        setMatchStats,
        medicalRecords,
        setMedicalRecords,
        inventory,
        setInventory,
        vehicles,
        setVehicles,
        purchaseOrders,
        setPurchaseOrders,
        posProducts,
        setPosProducts,
        posOrders,
        setPosOrders,
        documents,
        setDocuments,
        meetings,
        setMeetings,
        contracts,
        setContracts,
        leaves,
        setLeaves,
        finances,
        setFinances,
        invoices,
        setInvoices,
        sponsors,
        setSponsors,
        expenses,
        setExpenses,
        campaigns,
        setCampaigns,
        news,
        setNews,
        shopProducts,
        setShopProducts,
        tournaments,
        setTournaments,
        tickets,
        setTickets,
        talents,
        setTalents,
        academy,
        setAcademy,
        channels,
        setChannels,
        messages,
        setMessages,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </ClubContext.Provider>
  );
};

export const useClub = () => {
  const context = useContext(ClubContext);
  if (!context) {
    throw new Error('useClub must be used within a ClubProvider');
  }
  return context;
};
