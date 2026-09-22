import { apiFetch, setTokens, clearTokens } from './apiClient';

export interface UserBackendProfile {
  id: string | number;
  email: string;
  first_name: string;
  last_name: string;
  is_superuser?: boolean;
  is_staff?: boolean;
  is_2fa_enabled?: boolean;
  avatar?: string;
  phone_number?: string;
  [key: string]: any;
}

export interface LoginResponse {
  access?: string;
  refresh?: string;
  user?: UserBackendProfile;
  requires_2fa?: boolean;
  detail?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
}

export const authService = {
  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(data: RegisterPayload) {
    return apiFetch<{ detail: string; user: UserBackendProfile }>('/auth/accounts/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Connexion utilisateur via Email & Mot de passe
   */
  async login(email: string, password: string, totpCode: string = ''): Promise<LoginResponse> {
    const res = await apiFetch<LoginResponse>('/auth/accounts/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password, totp_code: totpCode }),
    });

    if (res.access && res.refresh) {
      setTokens(res.access, res.refresh);
    }

    return res;
  },

  /**
   * Récupérer les informations de l'utilisateur connecté
   */
  async getMe(): Promise<UserBackendProfile> {
    return apiFetch<UserBackendProfile>('/auth/accounts/me/', {
      method: 'GET',
    });
  },

  /**
   * Modifier le profil de base de l'utilisateur
   */
  async updateMe(data: Partial<UserBackendProfile>): Promise<UserBackendProfile> {
    return apiFetch<UserBackendProfile>('/auth/accounts/me/', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Déconnexion (Suppression des tokens JWT locaux)
   */
  logout() {
    clearTokens();
  }
};
