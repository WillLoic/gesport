import { apiFetch } from './apiClient';
import { ChatChannel, ChatMessage } from '../types';

// ═══════════════════════════════════════════════════════════════════
//  INTERFACES BACKEND (Messaging & Notifications Microservice #06)
// ═══════════════════════════════════════════════════════════════════

export interface BackendChannelMembership {
  id: number;
  user_id: number;
  user_name: string;
  role: 'ADMIN' | 'MEMBER';
  role_display: string;
  joined_at: string;
}

export interface BackendChatChannel {
  id: number;
  club_id: number;
  name: string;
  channel_type: 'PUBLIC' | 'PRIVATE' | 'TEAM';
  channel_type_display?: string;
  description: string;
  creator_id: number | null;
  is_active: boolean;
  memberships?: BackendChannelMembership[];
  created_at: string;
}

export interface BackendChannelMessage {
  id: number;
  channel: number;
  sender_id: number;
  sender_name: string;
  content: string;
  attachment_url: string | null;
  is_pinned: boolean;
  created_at: string;
}

export interface BackendConversation {
  id: number;
  user1_id: number;
  user2_id: number;
  created_at: string;
  updated_at: string;
  last_message?: string;
}

export interface BackendDirectMessage {
  id: number;
  conversation: number;
  sender_id: number;
  recipient_id: number;
  content: string;
  attachment_url: string | null;
  status: 'SENT' | 'READ';
  read_at: string | null;
  created_at: string;
}

export interface BackendNotification {
  id: number;
  club_id: number;
  user_id: number;
  title: string;
  message: string;
  category: 'SYSTEM' | 'CHAT' | 'SPORT' | 'FINANCE';
  category_display?: string;
  level: 'INFO' | 'WARNING' | 'URGENT';
  level_display?: string;
  status: 'UNREAD' | 'READ';
  status_display?: string;
  action_url: string | null;
  read_at: string | null;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════════
//  MAPPERS : Backend → Frontend types
// ═══════════════════════════════════════════════════════════════════

export function mapBackendChannelToFrontend(ch: BackendChatChannel): ChatChannel {
  let category: ChatChannel['category'] = 'Général';
  if (ch.channel_type === 'TEAM') category = 'Équipes';
  else if (ch.channel_type === 'PRIVATE') category = 'Staff & Direction';

  const name = ch.name.startsWith('#') ? ch.name : `#${ch.name}`;

  return {
    id: String(ch.id),
    name,
    description: ch.description || 'Canal d’échange interne du club.',
    isPrivate: ch.channel_type === 'PRIVATE',
    category,
    membersCount: ch.memberships?.length || 10,
    unreadCount: 0,
  };
}

export function mapBackendMessageToFrontend(msg: BackendChannelMessage): ChatMessage {
  const dateObj = msg.created_at ? new Date(msg.created_at) : new Date();
  const timestamp = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return {
    id: String(msg.id),
    channelId: String(msg.channel),
    senderName: msg.sender_name || 'Utilisateur',
    senderRole: 'Membre du Club',
    content: msg.content,
    timestamp,
    isPinned: msg.is_pinned,
    attachments: msg.attachment_url
      ? [{ name: 'Pièce jointe', size: '1.2 MB', type: 'PDF' }]
      : undefined,
  };
}

// ═══════════════════════════════════════════════════════════════════
//  SERVICES API
// ═══════════════════════════════════════════════════════════════════

export const chatService = {
  /**
   * Récupère les salons / canaux de discussion du club
   */
  async getChannels(clubId = 1): Promise<ChatChannel[]> {
    const channels = await apiFetch<BackendChatChannel[]>(`/chat/channels/?club_id=${clubId}`);
    return (channels || []).map(mapBackendChannelToFrontend);
  },

  /**
   * Crée un nouveau salon de discussion
   */
  async createChannel(data: {
    club_id?: number;
    name: string;
    description?: string;
    channel_type?: 'PUBLIC' | 'PRIVATE' | 'TEAM';
    creator_id?: number;
    creator_name?: string;
  }): Promise<ChatChannel> {
    const payload = {
      club_id: data.club_id || 1,
      creator_id: data.creator_id || 1,
      creator_name: data.creator_name || 'Admin',
      channel_type: data.channel_type || 'PUBLIC',
      ...data,
      name: data.name.replace(/^#/, ''),
    };

    const res = await apiFetch<BackendChatChannel>('/chat/channels/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapBackendChannelToFrontend(res);
  },

  /**
   * Récupère l'historique des messages d'un canal
   */
  async getChannelMessages(channelId: number | string): Promise<ChatMessage[]> {
    const messages = await apiFetch<BackendChannelMessage[]>(`/chat/channels/${channelId}/messages/`);
    return (messages || []).map(mapBackendMessageToFrontend);
  },

  /**
   * Publie un message dans un canal
   */
  async sendMessage(
    channelId: number | string,
    data: {
      sender_id?: number;
      sender_name: string;
      content: string;
      attachment_url?: string;
    }
  ): Promise<ChatMessage> {
    const payload = {
      sender_id: data.sender_id || 1,
      sender_name: data.sender_name,
      content: data.content,
      attachment_url: data.attachment_url || null,
    };

    const res = await apiFetch<BackendChannelMessage>(`/chat/channels/${channelId}/messages/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapBackendMessageToFrontend(res);
  },

  /**
   * Ajoute un membre à un salon
   */
  async addMember(channelId: number | string, data: { user_id: number; user_name: string; role?: 'ADMIN' | 'MEMBER' }) {
    return apiFetch(`/chat/channels/${channelId}/members/`, {
      method: 'POST',
      body: JSON.stringify({
        role: 'MEMBER',
        ...data,
      }),
    });
  },
};

export const directMessagesService = {
  /**
   * Récupère les conversations privées
   */
  async getConversations(userId = 1): Promise<BackendConversation[]> {
    return apiFetch<BackendConversation[]>(`/direct-messages/conversations/?user_id=${userId}`);
  },

  /**
   * Récupère les messages d'une conversation
   */
  async getMessages(conversationId: number | string): Promise<BackendDirectMessage[]> {
    return apiFetch<BackendDirectMessage[]>(`/direct-messages/messages/?conversation_id=${conversationId}`);
  },

  /**
   * Envoie un message privé
   */
  async sendMessage(data: {
    sender_id?: number;
    recipient_id: number;
    content: string;
    attachment_url?: string;
  }): Promise<BackendDirectMessage> {
    const payload = {
      sender_id: data.sender_id || 1,
      ...data,
    };
    return apiFetch<BackendDirectMessage>('/direct-messages/messages/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Marque une conversation comme lue
   */
  async markRead(conversationId: number | string, userId = 1) {
    return apiFetch(`/direct-messages/conversations/${conversationId}/read/`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  },
};

export const notificationService = {
  /**
   * Récupère les notifications d'un utilisateur
   */
  async getNotifications(userId = 1, status?: 'UNREAD' | 'READ'): Promise<BackendNotification[]> {
    const query = status ? `?user_id=${userId}&status=${status}` : `?user_id=${userId}`;
    return apiFetch<BackendNotification[]>(`/notifications/${query}`);
  },

  /**
   * Récupère le nombre de notifications non lues
   */
  async getUnreadCount(userId = 1): Promise<number> {
    const res = await apiFetch<{ unread_count: number }>(`/notifications/unread-count/?user_id=${userId}`);
    return res?.unread_count ?? 0;
  },

  /**
   * Marque une notification comme lue
   */
  async markRead(notificationId: number | string): Promise<BackendNotification> {
    return apiFetch<BackendNotification>(`/notifications/${notificationId}/read/`, {
      method: 'POST',
    });
  },

  /**
   * Marque toutes les notifications comme lues
   */
  async markAllRead(userId = 1) {
    return apiFetch('/notifications/read-all/', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  },
};

/**
 * Helper WebSocket pour la messagerie temps réel
 */
export function createChatWebSocket(
  channelId: number | string,
  callbacks: {
    onMessage: (message: ChatMessage) => void;
    onOpen?: () => void;
    onError?: (event: Event) => void;
    onClose?: (event: CloseEvent) => void;
  }
): WebSocket | null {
  if (typeof window === 'undefined') return null;

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.hostname;
  const wsUrl = `${protocol}//${host}:8000/ws/chat/${channelId}/`;

  try {
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      callbacks.onOpen?.();
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chat_message' || data.content) {
          const mapped = mapBackendMessageToFrontend({
            id: data.id || Date.now(),
            channel: Number(channelId),
            sender_id: data.sender_id || 1,
            sender_name: data.sender_name || 'Utilisateur',
            content: data.content || data.message || '',
            attachment_url: data.attachment_url || null,
            is_pinned: false,
            created_at: data.created_at || new Date().toISOString(),
          });
          callbacks.onMessage(mapped);
        }
      } catch (err) {
        console.warn('Erreur parsing websocket message:', err);
      }
    };

    socket.onerror = (e) => callbacks.onError?.(e);
    socket.onclose = (e) => callbacks.onClose?.(e);

    return socket;
  } catch (err) {
    console.warn('Impossible d’établir la connexion WebSocket:', err);
    return null;
  }
}
