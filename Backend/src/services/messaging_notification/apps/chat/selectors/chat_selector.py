from apps.chat.models import ChatChannel, ChannelMessage


def get_channels_for_club(club_id: int):
    """Retourne tous les salons actifs d'un club."""
    return ChatChannel.objects.filter(club_id=club_id, is_active=True).prefetch_related('memberships')


def get_channel_by_id(channel_id: int) -> ChatChannel | None:
    """Retourne un salon par son ID ou None s'il n'existe pas."""
    try:
        return ChatChannel.objects.get(id=channel_id, is_active=True)
    except ChatChannel.DoesNotExist:
        return None


def get_channel_messages(channel_id: int):
    """Retourne tous les messages d'un salon, du plus ancien au plus récent."""
    return ChannelMessage.objects.filter(channel_id=channel_id).order_by('created_at')
