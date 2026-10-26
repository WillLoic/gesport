import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Paperclip,
  Search,
  Users,
  Shield,
  CheckCheck,
  Plus,
  X,
  Hash,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { ChatChannel, ChatMessage } from '../../types';
import { chatService, createChatWebSocket } from '../../services/messagingService';

export const InternalMessagingView: React.FC = () => {
  const { channels, setChannels, messages, setMessages, showToast } = useClub();
  const [selectedChannelId, setSelectedChannelId] = useState<string>(channels[0]?.id || '1');
  const [messageInput, setMessageInput] = useState('');
  const [isNewChannelModalOpen, setIsNewChannelModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // New Channel Form State
  const [newChannelName, setNewChannelName] = useState('');
  const [newCategory, setNewCategory] = useState('Équipes & Groupes');
  const [newDescription, setNewDescription] = useState('');
  const [newMembersCount, setNewMembersCount] = useState(14);
  const [hasAttachedFile, setHasAttachedFile] = useState(false);

  const selectedChannel = channels.find(c => c.id === selectedChannelId) || channels[0];
  const channelMessages = messages.filter(m => m.channelId === selectedChannelId);

  // Chargement des messages lorsque le canal sélectionné change
  useEffect(() => {
    if (!selectedChannel) return;
    const numericId = parseInt(selectedChannel.id, 10);
    if (!isNaN(numericId)) {
      chatService
        .getChannelMessages(numericId)
        .then((remoteMsgs) => {
          if (remoteMsgs && remoteMsgs.length > 0) {
            setMessages(prev => {
              // Remplacer ou fusionner les messages de ce canal
              const other = prev.filter(m => m.channelId !== selectedChannel.id);
              return [...other, ...remoteMsgs];
            });
          }
        })
        .catch(() => null);
    }
  }, [selectedChannelId]);

  // Connexion WebSocket temps réel sur le canal actif
  useEffect(() => {
    if (!selectedChannel) return;
    const numericId = parseInt(selectedChannel.id, 10);
    if (isNaN(numericId)) return;

    if (wsRef.current) {
      wsRef.current.close();
    }

    const socket = createChatWebSocket(numericId, {
      onOpen: () => setIsWsConnected(true),
      onClose: () => setIsWsConnected(false),
      onError: () => setIsWsConnected(false),
      onMessage: (newMsg) => {
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      },
    });

    wsRef.current = socket;

    return () => {
      socket?.close();
    };
  }, [selectedChannelId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChannel) return;

    const content = messageInput.trim();
    setMessageInput('');

    const fallbackMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      channelId: selectedChannel.id,
      senderName: 'Alexandre Laurent (Président)',
      senderRole: 'Président',
      content,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      attachments: hasAttachedFile
        ? [{ name: 'Planning-Offensive-Tactique.pdf', size: '2.1 MB', type: 'PDF' }]
        : undefined,
    };

    setMessages(prev => [...prev, fallbackMsg]);
    setHasAttachedFile(false);

    const numericId = parseInt(selectedChannel.id, 10);
    if (!isNaN(numericId)) {
      try {
        const sentMsg = await chatService.sendMessage(numericId, {
          sender_id: 1,
          sender_name: 'Alexandre Laurent (Président)',
          content,
          attachment_url: hasAttachedFile ? 'https://s3.local.gesport/vault/planning.pdf' : undefined,
        });

        // Remplacer le message fallback par celui confirmé par le backend
        setMessages(prev => prev.map(m => (m.id === fallbackMsg.id ? sentMsg : m)));
        showToast('Message diffusé sur le canal !');
      } catch (err) {
        console.warn('Erreur envoi message backend, mode local conservé:', err);
      }
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) {
      showToast('Veuillez renseigner le nom du canal.');
      return;
    }

    setIsSubmitting(true);

    const formattedName = newChannelName.startsWith('#')
      ? newChannelName.trim()
      : `#${newChannelName.trim().toLowerCase().replace(/\s+/g, '-')}`;

    const fallbackChan: ChatChannel = {
      id: `ch-${Date.now()}`,
      name: formattedName,
      description: newDescription.trim() || 'Canal d’échange interne.',
      category: (newCategory.includes('Équipes') ? 'Équipes' : 'Staff & Direction') as any,
      isPrivate: false,
      membersCount: Number(newMembersCount) || 10,
      unreadCount: 0,
    };

    let channelType: 'PUBLIC' | 'PRIVATE' | 'TEAM' = 'PUBLIC';
    if (newCategory.includes('Équipes')) channelType = 'TEAM';
    else if (newCategory.includes('Staff')) channelType = 'PRIVATE';

    try {
      const createdChan = await chatService.createChannel({
        club_id: 1,
        name: formattedName,
        description: newDescription.trim(),
        channel_type: channelType,
        creator_id: 1,
        creator_name: 'Alexandre Laurent',
      });

      setChannels(prev => [createdChan, ...prev]);
      setSelectedChannelId(createdChan.id);
      showToast(`Canal "${createdChan.name}" créé et synchronisé avec le microservice !`);
    } catch (err) {
      console.warn('Erreur création canal backend, mode local:', err);
      setChannels(prev => [fallbackChan, ...prev]);
      setSelectedChannelId(fallbackChan.id);
      showToast(`Canal "${fallbackChan.name}" créé en mode local.`);
    } finally {
      setIsSubmitting(false);
      setIsNewChannelModalOpen(false);
      setNewChannelName('');
      setNewDescription('');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Messagerie Interne & Canaux</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Espace centralisé d'échanges sécurisés par équipe, annonces officielles du bureau et notifications
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewChannelModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          Nouveau Canal
        </button>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-3 min-h-[620px] overflow-hidden">
        {/* Channels List (Left 1 col) */}
        <div className="border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher une conversation..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white outline-hidden"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {channels.map(channel => {
              const isSelected = channel.id === selectedChannelId;
              const chMsgs = messages.filter(m => m.channelId === channel.id);
              const lastMsg = chMsgs[chMsgs.length - 1];
              return (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => setSelectedChannelId(channel.id)}
                  className={`w-full p-4 text-left transition-all flex items-start gap-3 cursor-pointer ${
                    isSelected ? 'bg-blue-50/80 border-r-4 border-blue-600' : 'hover:bg-slate-100/60'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{channel.name}</h4>
                      {channel.unreadCount ? (
                        <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                          {channel.unreadCount}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {lastMsg ? `${lastMsg.senderName.split(' ')[0]}: ${lastMsg.content}` : channel.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-700 font-medium">
                        {channel.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                        <Users className="w-3 h-3" /> {channel.membersCount}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Conversation Feed (Right 2 cols) */}
        <div className="md:col-span-2 flex flex-col justify-between bg-white h-full">
          {/* Channel Header Bar */}
          {selectedChannel && (
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/30">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">{selectedChannel.name}</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {selectedChannel.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{selectedChannel.description}</p>
              </div>

              <div className="flex items-center gap-3">
                {isWsConnected ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <Wifi className="w-3 h-3 text-emerald-600 animate-pulse" /> En direct (WebSocket)
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    <WifiOff className="w-3 h-3 text-slate-400" /> Mode standard (REST)
                  </span>
                )}
                <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <Users className="w-4 h-4 text-slate-500" />
                  {selectedChannel.membersCount} membres
                </div>
              </div>
            </div>
          )}

          {/* Messages Stream */}
          <div className="p-6 space-y-4 overflow-y-auto flex-1 max-h-[440px]">
            {channelMessages.map(msg => (
              <div key={msg.id} className="flex flex-col space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">{msg.senderName}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                    {msg.senderRole}
                  </span>
                  <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-800 max-w-xl self-start">
                  <p className="leading-relaxed">{msg.content}</p>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.attachments.map((att, i) => (
                        <div key={i} className="p-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-blue-600 flex items-center gap-1.5">
                          <Paperclip className="w-3.5 h-3.5" />
                          {att.name} ({att.size})
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[10px] text-slate-400 pl-1">
                  <CheckCheck className="w-3 h-3 text-blue-500" />
                  <span>Délivré</span>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setHasAttachedFile(!hasAttachedFile);
                showToast(hasAttachedFile ? 'Pièce jointe retirée.' : 'Fichier "Planning-Offensive-Tactique.pdf" joint !');
              }}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                hasAttachedFile
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'
              }`}
              title="Ajouter un document joint"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <input
              type="text"
              placeholder={`Écrire dans ${selectedChannel?.name}...`}
              value={messageInput}
              onChange={e => setMessageInput(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:border-blue-600 outline-hidden"
            />

            <button
              type="submit"
              disabled={!messageInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Envoyer
            </button>
          </form>
        </div>
      </div>

      {/* New Channel Modal */}
      {isNewChannelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Hash className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 font-display">Créer un Nouveau Canal</h3>
                  <p className="text-xs text-slate-500">Canal de discussion par équipe, staff ou projet</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewChannelModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateChannel} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nom du Canal (avec ou sans #) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: equipe-u18-region, comite-directeur, buvette-matchs..."
                  value={newChannelName}
                  onChange={e => setNewChannelName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Catégorie
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    <option value="Équipes & Groupes">Équipes & Groupes</option>
                    <option value="Direction & Bureau">Direction & Bureau</option>
                    <option value="Staff & Entraîneurs">Staff & Entraîneurs</option>
                    <option value="Événements & Tournois">Événements & Tournois</option>
                    <option value="Général & Adhérents">Général & Adhérents</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nombre de Membres Initiaux
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newMembersCount}
                    onChange={e => setNewMembersCount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-bold text-slate-900 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description / Objet des échanges
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Coordination des convocations, feuilles de match et covoiturages..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewChannelModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md transition-colors"
                >
                  {isSubmitting ? 'Création du canal...' : 'Créer le Canal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
