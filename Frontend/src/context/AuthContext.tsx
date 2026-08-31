import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, User, Club, UserClubRole } from '../services/authApi';

export type RoleCode =
  | 'SUPER_ADMIN'
  | 'CLUB_ADMIN'
  | 'TREASURER'
  | 'COACH'
  | 'MEDICAL_STAFF'
  | 'LOGISTICS'
  | 'MEMBER';

export interface AuthContextType {
  currentUser: User | null;
  activeClub: Club | null;
  userClubs: Club[];
  activeRole: RoleCode;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  isProfileModalOpen: boolean;
  isClubSwitchModalOpen: boolean;
  isRoleModalOpen: boolean;
  authModalInitialTab: 'login' | 'register';
  
  // Actions
  login: (email: string, password: string, totpCode?: string) => Promise<any>;
  register: (data: any) => Promise<any>;
  logout: () => void;
  switchClub: (club: Club) => void;
  createClub: (data: any) => Promise<Club>;
  updateUser: (updatedFields: Partial<User>) => void;
  enable2FA: (totpCode: string) => Promise<any>;
  disable2FA: (password: string) => Promise<any>;
  
  // Modals controls
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  openClubSwitchModal: () => void;
  closeClubSwitchModal: () => void;
  openRoleModal: () => void;
  closeRoleModal: () => void;
  
  // RBAC Helper
  hasRole: (allowedRoles: RoleCode[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 1,
    email: 'president@gesport.fr',
    first_name: 'Alexandre',
    last_name: 'Lefebvre',
    full_name: 'Alexandre Lefebvre',
    phone_number: '0612345678',
    is_email_verified: true,
    is_2fa_enabled: false,
    profile: {
      city: 'Montrouge',
      bio: 'Président du club omnisports GESPORT',
      emergency_contact_name: 'Sophie Lefebvre',
      emergency_contact_phone: '0698765432'
    }
  });

  const [userClubs, setUserClubs] = useState<Club[]>([
    {
      id: 1,
      name: 'AS Montrouge Omnisports',
      slug: 'as-montrouge-omnisports',
      short_name: 'ASMO',
      primary_color: '#1e40af',
      secondary_color: '#3b82f6',
      city: 'Montrouge',
      is_active: true,
      current_season: {
        id: 101,
        name: '2025-2026',
        start_date: '2025-09-01',
        end_date: '2026-06-30',
        is_current: true,
      }
    },
    {
      id: 2,
      name: 'BC Paris Volley',
      slug: 'bc-paris-volley',
      short_name: 'BCPV',
      primary_color: '#0d9488',
      secondary_color: '#14b8a6',
      city: 'Paris',
      is_active: true,
      current_season: {
        id: 102,
        name: '2025-2026',
        start_date: '2025-09-01',
        end_date: '2026-06-30',
        is_current: true,
      }
    }
  ]);

  const [activeClub, setActiveClub] = useState<Club | null>(userClubs[0]);
  const [activeRole, setActiveRole] = useState<RoleCode>('SUPER_ADMIN');

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isClubSwitchModalOpen, setIsClubSwitchModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<'login' | 'register'>('login');

  const isAuthenticated = !!currentUser;

  // Sync clubs on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('gesport_access_token');
    if (token) {
      authApi.getClubs().then(clubs => {
        if (clubs && clubs.length > 0) {
          setUserClubs(clubs);
          setActiveClub(clubs[0]);
        }
      }).catch(() => {});
    }
  }, []);

  const login = async (email: string, password: string, totpCode?: string) => {
    const res = await authApi.login({ email, password, totp_code: totpCode });
    if (res.user) {
      setCurrentUser(res.user);
    }
    return res;
  };

  const register = async (data: any) => {
    const res = await authApi.register(data);
    if (res.user) {
      setCurrentUser(res.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('gesport_access_token');
    localStorage.removeItem('gesport_refresh_token');
    setCurrentUser(null);
  };

  const switchClub = (club: Club) => {
    setActiveClub(club);
    // Simuler le changement de rôle selon le club sélectionné
    if (club.id === 2) {
      setActiveRole('COACH');
    } else {
      setActiveRole('SUPER_ADMIN');
    }
  };

  const createClub = async (data: any) => {
    const newClub = await authApi.createClub(data);
    setUserClubs(prev => [...prev, newClub]);
    setActiveClub(newClub);
    return newClub;
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (!currentUser) return;
    setCurrentUser(prev => prev ? { ...prev, ...updatedFields } : null);
  };

  const enable2FA = async (totpCode: string) => {
    const res = await authApi.verify2FA(totpCode);
    if (currentUser) {
      setCurrentUser({ ...currentUser, is_2fa_enabled: true });
    }
    return res;
  };

  const disable2FA = async (password: string) => {
    const res = await authApi.disable2FA(password);
    if (currentUser) {
      setCurrentUser({ ...currentUser, is_2fa_enabled: false });
    }
    return res;
  };

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalInitialTab(tab);
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  const openClubSwitchModal = () => setIsClubSwitchModalOpen(true);
  const closeClubSwitchModal = () => setIsClubSwitchModalOpen(false);

  const openRoleModal = () => setIsRoleModalOpen(true);
  const closeRoleModal = () => setIsRoleModalOpen(false);

  const hasRole = (allowedRoles: RoleCode[]) => {
    if (activeRole === 'SUPER_ADMIN') return true; // Super admin a accès à tout
    return allowedRoles.includes(activeRole);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeClub,
        userClubs,
        activeRole,
        isAuthenticated,
        isAuthModalOpen,
        isProfileModalOpen,
        isClubSwitchModalOpen,
        isRoleModalOpen,
        authModalInitialTab,

        login,
        register,
        logout,
        switchClub,
        createClub,
        updateUser,
        enable2FA,
        disable2FA,

        openAuthModal,
        closeAuthModal,
        openProfileModal,
        closeProfileModal,
        openClubSwitchModal,
        closeClubSwitchModal,
        openRoleModal,
        closeRoleModal,

        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur de AuthProvider');
  }
  return context;
};
