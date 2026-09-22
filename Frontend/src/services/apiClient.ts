/// <reference types="vite/client" />

/**
 * Client HTTP pour communiquer avec l'API Gateway Backend Django.
 * Gère le baseURL, l'ajout automatique du jeton Bearer JWT,
 * et le rafraîchissement automatique du token en cas d'erreur 401.
 */

const rawUrl = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
const API_BASE_URL = rawUrl.trim().replace(/\/+$/, '');

export interface ApiError {
  message: string;
  status?: number;
  details?: Record<string, any>;
}

export const getAccessToken = (): string | null => {
  return localStorage.getItem('gesport_access_token');
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('gesport_refresh_token');
};

export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem('gesport_access_token', access);
  localStorage.setItem('gesport_refresh_token', refresh);
};

export const clearTokens = () => {
  localStorage.removeItem('gesport_access_token');
  localStorage.removeItem('gesport_refresh_token');
};

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

/**
 * Fonction de requête générique HTTP
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const accessToken = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(url, { ...options, headers });

  // Gestion du rafraîchissement de token (401 Unauthorized)
  if (response.status === 401 && !endpoint.includes('/auth/accounts/login/')) {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      if (isRefreshing) {
        // Si un rafraîchissement est déjà en cours, attendre qu'il se termine
        try {
          const newToken = await new Promise<string>((resolve) => {
            addRefreshSubscriber((token: string) => resolve(token));
          });
          headers['Authorization'] = `Bearer ${newToken}`;
          response = await fetch(url, { ...options, headers });
        } catch {
          // Si l'attente échoue, continuer vers la gestion d'erreur standard
        }
      } else {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/accounts/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            const newAccess = data.access;
            setTokens(newAccess, refreshToken);
            isRefreshing = false;
            onRefreshed(newAccess);

            // Re-tester la requête courante avec le nouveau jeton d'accès
            headers['Authorization'] = `Bearer ${newAccess}`;
            response = await fetch(url, { ...options, headers });
          } else {
            isRefreshing = false;
            // Ne déconnecter l'utilisateur QUE si la requête échoie concerne l'authentification IAM principale
            if (endpoint.includes('/auth/')) {
              clearTokens();
              window.dispatchEvent(new CustomEvent('gesport_auth_expired'));
            }
          }
        } catch (err) {
          isRefreshing = false;
          if (endpoint.includes('/auth/')) {
            clearTokens();
            window.dispatchEvent(new CustomEvent('gesport_auth_expired'));
          }
        }
      }
    }
  }

  if (!response.ok) {
    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch {
      errorData = { detail: response.statusText };
    }

    const error: ApiError = {
      message: errorData.detail || errorData.message || 'Une erreur est survenue sur le serveur.',
      status: response.status,
      details: errorData,
    };
    throw error;
  }

  // Pour les réponses 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
