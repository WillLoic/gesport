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
  Trash2,
  Pin,
  Lock,
  Globe,
  MoreVertical,
  FileText,
  Image as ImageIcon,
  Download,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { ChatChannel, ChatMessage } from '../../types';
import { chatService, createChatWebSocket } from '../../services/messagingService';
import { vaultService } from '../../services/documentsService';

export const InternalMessagingView: React.FC = () => {
  const { channels, setChannels, messages, setMessages, staff, showToast } = useClub();
  const [selectedChannelId, setSelectedChannelId] = useState<string>('');
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState<'all' | 'Général' | 'Équipes' | 'Staff & Direction'>('all');

  // Modal State
  const [isNewChannelModalOpen, setIsNewChannelModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingChannel, setDeletingChannel] = useState<ChatChannel | null>(null);

  // New Channel Form State
  const [newChannelName, setNewChannelName] = useState('');
  const [newCategory, setNewCategory] = useState<'Général' | 'Équipes' | 'Staff & Direction'>('Général');
  const [newDescription, setNewDescription] = useState('');

  // Attachment State
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // WebSocket & Polling Connection State
  const [isWsConnected, setIsWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sélectionne par défaut le premier canal disponible
  useEffect(() => {
    if (!selectedChannelId && channels.length > 0) {
      setSelectedChannelId(channels[0].id);
    }
  }, [channels, selectedChannelId]);

  const selectedChannel = channels.find((c) => c.id === selectedChannelId) || channels[0];
  const channelMessages = messages.filter((m) => m.channelId === selectedChannelId);

  // Filtrage des salons par catégorie et terme de recherche
  const filteredChannels = channels.filter((c) => {
    const matchesFilter = channelFilter === 'all' || c.category === channelFilter;
    const matchesSearch =
      searchTerm === '' ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Auto-scroll vers le dernier message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [channelMessages.length]);

  // 1. Chargement initial de l'historique quand le canal change
  useEffect(() => {
    if (!selectedChannel) return;
    const numericId = parseInt(selectedChannel.id, 10);
    if (!isNaN(numericId)) {
      chatService
        .getChannelMessages(numericId)
        .then((remoteMsgs) => {
          if (remoteMsgs) {
            setMessages((prev) => {
              const other = prev.filter((m) => m.channelId !== selectedChannel.id);
              return [...other, ...remoteMsgs];
            });
          }
        })
        .catch(() => null);
    }
  }, [selectedChannelId]);

  // 2. Connexion WebSocket temps réel avec bascule automatique
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
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      },
    });

    wsRef.current = socket;

    return () => {
      socket?.close();
    };
  }, [selectedChannelId]);

  // 3. Polling intelligent de secours (toutes les 4 secondes) pour assurer la synchro même sans Daphne
  useEffect(() => {
    if (!selectedChannel) return;
    const numericId = parseInt(selectedChannel.id, 10);
    if (isNaN(numericId)) return;

    const interval = setInterval(async () => {
      try {
        const currentChanMsgs = messages.filter((m) => m.channelId === selectedChannel.id);
        const lastMsgId = currentChanMsgs.length > 0 ? parseInt(currentChanMsgs[currentChanMsgs.length - 1].id, 10) : undefined;
        const validSince = lastMsgId && !isNaN(lastMsgId) ? lastMsgId : undefined;

        const newMessages = await chatService.getChannelMessages(numericId, validSince);
        if (newMessages && newMessages.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const additions = newMessages.filter((m) => !existingIds.has(m.id));
            if (additions.length === 0) return prev;
            return [...prev, ...additions];
          });
        }
      } catch {
        // En cas d'erreur de requête silencieux
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedChannelId, messages]);

  // Gestion de l'envoi de message (texte + pièce jointe)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageInput.trim() && !attachedFile) || !selectedChannel) return;

    const content = messageInput.trim();
    const fileToSend = attachedFile;
    setMessageInput('');
    setAttachedFile(null);

    let attachmentUrl: string | undefined = undefined;

    // Si un vrai fichier est joint, on l'upload d'abord dans le coffre-fort
    if (fileToSend) {
      setIsUploadingAttachment(true);
      try {
        const formData = new FormData();
        formData.append('file', fileToSend);
        formData.append('title', `Pièce jointe chat #${selectedChannel.name}`);
        formData.append('category', 'Messagerie');
        formData.append('confidentiality_level', selectedChannel.isPrivate ? 'CONFIDENTIAL' : 'PUBLIC');
        formData.append('uploaded_by', staff[0]?.name || 'Alexandre Laurent');

        const doc = await vaultService.uploadDocument(formData);
        attachmentUrl = doc.downloadUrl;
        showToast(`Fichier "${fileToSend.name}" téléversé et joint au message !`);
      } catch (err) {
        console.warn('Erreur téléversement pièce jointe:', err);
        showToast('Erreur lors du téléversement du fichier.');
      } finally {
        setIsUploadingAttachment(false);
      }
    }

    const currentSender = staff[0]?.name || 'Alexandre Laurent (Président)';
    const numericId = parseInt(selectedChannel.id, 10);

    // Fallback optimiste immédiat dans l'interface
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: tempId,
      channelId: selectedChannel.id,
      senderName: currentSender,
      senderRole: 'Membre du Club',
      content,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      attachments: attachmentUrl
        ? [{ name: fileToSend?.name || 'Pièce jointe', size: 'Fichier joint', type: 'FILE', url: attachmentUrl }]
        : undefined,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    if (!isNaN(numericId)) {
      try {
        const sentMsg = await chatService.sendMessage(numericId, {
          sender_id: 1,
          sender_name: currentSender,
          content,
          attachment_url: attachmentUrl,
        });

        // Remplace le message optimiste par la confirmation du backend
        setMessages((prev) => prev.map((m) => (m.id === tempId ? sentMsg : m)));
      } catch (err: any) {
        console.warn('Erreur envoi message backend:', err);
        showToast('Erreur envoi message au serveur.');
      }
    }
  };

  // Suppression d'un message
  const handleDeleteMessage = async (msgId: string) => {
    try {
      const numericId = parseInt(msgId, 10);
      if (!isNaN(numericId)) {
        await chatService.deleteMessage(numericId);
      }
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
      showToast('Message supprimé.');
    } catch (err: any) {
      showToast(`Erreur suppression: ${err.message || 'Serveur indisponible'}`);
    }
  };

  // Épinglage d'un message
  const handleTogglePin = async (msgId: string) => {
    try {
      const numericId = parseInt(msgId, 10);
      if (!isNaN(numericId)) {
        const updated = await chatService.togglePinMessage(numericId);
        setMessages((prev) => prev.map((m) => (m.id === msgId ? updated : m)));
        showToast(updated.isPinned ? 'Message épinglé en tête du salon !' : 'Message désépinglé.');
      }
    } catch (err: any) {
      showToast(`Erreur: ${err.message || 'Action impossible'}`);
    }
  };

  // Création d'un nouveau canal
  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) {
      showToast('Veuillez renseigner le nom du canal.');
      return;
    }

    setIsSubmitting(true);
    const cleanName = newChannelName.trim().lstrip ? newChannelName.trim().replace(/^#/, '') : newChannelName.trim();

    let channelType: 'PUBLIC' | 'PRIVATE' | 'TEAM' = 'PUBLIC';
    if (newCategory === 'Équipes') channelType = 'TEAM';
    else if (newCategory === 'Staff & Direction') channelType = 'PRIVATE';

    try {
      const createdChan = await chatService.createChannel({
        club_id: 1,
        name: cleanName,
        description: newDescription.trim() || `Salon ${newCategory}`,
        channel_type: channelType,
        creator_id: 1,
        creator_name: staff[0]?.name || 'Direction',
      });

      setChannels((prev) => [...prev, createdChan]);
      setSelectedChannelId(createdChan.id);
      showToast(`Canal "${createdChan.name}" créé avec succès !`);

      setIsNewChannelModalOpen(false);
      setNewChannelName('');
      setNewDescription('');
    } catch (err: any) {
      console.error('Erreur création canal:', err);
      showToast(`Erreur création canal: ${err.message || 'Serveur indisponible'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Suppression d'un canal
  const handleConfirmDeleteChannel = async () => {
    if (!deletingChannel) return;
    try {
      const numericId = parseInt(deletingChannel.id, 10);
      if (!isNaN(numericId)) {
        await chatService.deleteChannel(numericId);
      }

      setChannels((prev) => prev.filter((c) => c.id !== deletingChannel.id));
      setMessages((prev) => prev.filter((m) => m.channelId !== deletingChannel.id));

      const remaining = channels.filter((c) => c.id !== deletingChannel.id);
      if (remaining.length > 0) {
        setSelectedChannelId(remaining[0].id);
      }

      showToast(`Salon "${deletingChannel.name}" et ses messages supprimés.`);
      setDeletingChannel(null);
    } catch (err: any) {
      showToast(`Erreur suppression salon: ${err.message || 'Serveur indisponible'}`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Messagerie Interne & Canaux</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Salons d'échange par équipe, coordination du staff et annonces officielles du bureau
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewChannelModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nouveau Canal
        </button>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 min-h-[660px] max-h-[750px] overflow-hidden">
        {/* Left Column: Channels List */}
        <div className="border-r border-slate-200 flex flex-col bg-slate-50/50 md:col-span-1">
          {/* Search bar */}
          <div className="p-3.5 border-b border-slate-200 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrer les salons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white outline-hidden"
              />
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1 overflow-x-auto text-[11px] pb-0.5">
              {(['all', 'Général', 'Équipes', 'Staff & Direction'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setChannelFilter(cat)}
                  className={`px-2 py-0.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    channelFilter === cat ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  {cat === 'all' ? 'Tous' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Channel items list */}
          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {filteredChannels.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <Hash className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                Aucun salon trouvé.
              </div>
            ) : (
              filteredChannels.map((channel) => {
                const isSelected = channel.id === selectedChannelId;
                const chMsgs = messages.filter((m) => m.channelId === channel.id);
                const lastMsg = chMsgs[chMsgs.length - 1];

                return (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => setSelectedChannelId(channel.id)}
                    className={`w-full p-3.5 text-left transition-all flex items-start gap-3 cursor-pointer group ${
                      isSelected ? 'bg-blue-50/90 border-r-4 border-blue-600' : 'hover:bg-slate-100/70'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        channel.isPrivate
                          ? 'bg-amber-100 text-amber-700'
                          : channel.category === 'Équipes'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {channel.isPrivate ? <Lock className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {channel.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0">
                          {chMsgs.length} msg
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {lastMsg ? `${lastMsg.senderName.split(' ')[0]}: ${lastMsg.content}` : channel.description}
                      </p>

                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-700 font-medium">
                          {channel.category}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                          <Users className="w-3 h-3" /> {channel.membersCount}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation Feed */}
        <div className="md:col-span-2 lg:col-span-3 flex flex-col justify-between bg-white h-full">
          {/* Channel Header Bar */}
          {selectedChannel ? (
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/40">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  {selectedChannel.isPrivate ? <Lock className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{selectedChannel.name}</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {selectedChannel.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{selectedChannel.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                                {/*suprimer a partir d'ici pour le message front de synchro*/}
                                {/* Statut de connexion */}
                {isWsConnected ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    <Wifi className="w-3 h-3 text-emerald-600 animate-pulse" /> Direct (WS)
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                    <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" /> Synchro REST
                  </span>
                )}

                              {/*jusqu'ici*/}
                <button
                  type="button"
                  onClick={() => setDeletingChannel(selectedChannel)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Supprimer ce salon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 border-b border-slate-200 text-xs text-slate-400">Aucun salon sélectionné.</div>
          )}

          {/* Pinned Messages Banner */}
          {channelMessages.some((m) => m.isPinned) && (
            <div className="p-2.5 bg-amber-50/80 border-b border-amber-200/80 flex items-center gap-2 text-xs text-amber-800">
              <Pin className="w-3.5 h-3.5 text-amber-600 shrink-0 rotate-45" />
              <div className="truncate flex-1">
                <span className="font-bold">Message épinglé : </span>
                {channelMessages.find((m) => m.isPinned)?.content}
              </div>
            </div>
          )}

          {/* Messages Stream */}
          <div className="p-6 space-y-4 overflow-y-auto flex-1 max-h-[460px] bg-slate-50/30">
            {channelMessages.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 space-y-2">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-700">Aucun message pour le moment</p>
                <p className="text-slate-400">Soyez le premier à envoyer un message dans {selectedChannel?.name} !</p>
              </div>
            ) : (
              channelMessages.map((msg) => (
                <div key={msg.id} className="flex flex-col space-y-1 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{msg.senderName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                        {msg.senderRole}
                      </span>
                      <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                      {msg.isPinned && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                          <Pin className="w-2.5 h-2.5 rotate-45" /> Épinglé
                        </span>
                      )}
                    </div>

                    {/* Actions sur le message (Épingler, Supprimer) */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleTogglePin(msg.id)}
                        className="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        title={msg.isPinned ? 'Désépingler' : 'Épingler'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Supprimer le message"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className={`p-3 rounded-2xl text-xs sm:text-sm text-slate-800 max-w-xl self-start ${
                    msg.isPinned ? 'bg-amber-50/70 border border-amber-200' : 'bg-white border border-slate-200 shadow-2xs'
                  }`}>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                    {/* Pièces jointes réelles */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2.5 space-y-1.5 pt-2 border-t border-slate-100">
                        {msg.attachments.map((att, i) => (
                          <div
                            key={i}
                            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 truncate">
                              {att.type === 'IMAGE' ? (
                                <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : (
                                <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                              )}
                              <span className="truncate">{att.name}</span>
                            </div>

                            {att.url && (
                              <button
                                type="button"
                                onClick={() => window.open(att.url, '_blank')}
                                className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-bold shrink-0"
                              >
                                <Download className="w-3 h-3" /> Ouvrir
                              </button>
                            )}
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
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <div className="p-3.5 border-t border-slate-200 bg-white">
            {/* Aperçu du fichier joint avant envoi */}
            {attachedFile && (
              <div className="mb-2 p-2 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs text-blue-800 animate-in fade-in">
                <div className="flex items-center gap-2 truncate">
                  <Paperclip className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-semibold truncate">{attachedFile.name}</span>
                  <span className="text-[10px] text-blue-600">
                    ({(attachedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="p-1 text-slate-400 hover:text-rose-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setAttachedFile(e.target.files[0]);
                  }
                }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                  attachedFile ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
                title="Joindre un fichier réel (PDF, Image, Document)"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                placeholder={selectedChannel ? `Écrire dans #${selectedChannel.name}...` : 'Écrire un message...'}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 outline-hidden transition-all"
              />

              <button
                type="submit"
                disabled={(!messageInput.trim() && !attachedFile) || isUploadingAttachment}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
              >
                {isUploadingAttachment ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Envoyer</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* New Channel Modal */}
      {isNewChannelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Hash className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 font-display">Créer un Nouveau Canal</h3>
                  <p className="text-xs text-slate-500">Salon de discussion interne GeSport</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewChannelModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateChannel} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nom du Canal *
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="ex: u18-masculin, tournoi-printemps, bureau-directeur"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Catégorie du Salon
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-800 outline-hidden"
                >
                  <option value="Général">Général (Tous les membres)</option>
                  <option value="Équipes">Équipes & Groupes sportifs</option>
                  <option value="Staff & Direction">Staff & Direction (Privé)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description / Objectif
                </label>
                <textarea
                  rows={2}
                  placeholder="Objectif de ce salon d'échange..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-800 outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewChannelModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs"
                >
                  {isSubmitting ? 'Création...' : 'Créer le Salon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Channel Confirmation Modal */}
      {deletingChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 font-display">Supprimer le Canal</h3>
                <p className="text-xs text-slate-500">Action irréversible sur la messagerie</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 text-xs text-rose-800 leading-relaxed">
              <p className="font-semibold mb-1">
                Êtes-vous sûr de vouloir supprimer le canal "#{deletingChannel.name}" ?
              </p>
              <p className="text-rose-700">
                Cette action supprimera définitivement le salon ainsi que tous les messages et pièces jointes échangés dans ce canal.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingChannel(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteChannel}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
              >
                Oui, Supprimer le Canal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
