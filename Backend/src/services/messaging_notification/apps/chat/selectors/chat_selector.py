from typing import Optional
from apps.chat.models import ChatChannel, ChannelMessage
from apps.chat.services.chat_service import ensure_default_channels


def get_channels_for_club(club_id: int):
    """Retourne tous les salons actifs d'un club, avec initialisation si vide."""
    channels = ChatChannel.objects.filter(club_id=club_id, is_active=True).prefetch_related('memberships')
    if not channels.exists():
        ensure_default_channels(club_id=club_id)
        channels = ChatChannel.objects.filter(club_id=club_id, is_active=True).prefetch_related('memberships')
    return channels


def get_channel_by_id(channel_id: int) -> Optional[ChatChannel]:
    """Retourne un salon par son ID ou None s'il n'existe pas."""
    try:
        return ChatChannel.objects.get(id=channel_id, is_active=True)
    except ChatChannel.DoesNotExist:
        return None


def get_channel_messages(channel_id: int, since_id: Optional[int] = None):
    """
    Retourne tous les messages d'un salon, du plus ancien au plus récent.
    Si since_id est spécifié, ne renvoie que les messages créés après since_id (pour le rafraîchissement temps réel).
    """
    qs = ChannelMessage.objects.filter(channel_id=channel_id)
    if since_id:
        qs = qs.filter(id__gt=since_id)
    return qs.order_by('created_at')
