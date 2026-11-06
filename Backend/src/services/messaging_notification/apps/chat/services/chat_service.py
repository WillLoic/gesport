from typing import Optional
from asgiref.sync import async_to_sync
from apps.chat.models import ChatChannel, ChannelMembership, ChannelMessage, MembershipRole, ChannelType


def _broadcast_to_channel_layer(channel_id: int, message_data: dict) -> None:
    """
    Tente de diffuser le message sur le ChannelLayer (WebSockets) si Channels/Redis/InMemory est disponible.
    En cas d'absence de Channels ou d'erreur, ne bloque jamais l'exécution HTTP.
    """
    try:
        from channels.layers import get_channel_layer
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f'chat_{channel_id}',
                {
                    'type': 'chat_message',
                    'id': message_data.get('id'),
                    'message': message_data.get('content', ''),
                    'content': message_data.get('content', ''),
                    'sender_id': message_data.get('sender_id'),
                    'sender_name': message_data.get('sender_name'),
                    'channel_id': channel_id,
                    'attachment_url': message_data.get('attachment_url'),
                    'is_pinned': message_data.get('is_pinned', False),
                    'created_at': message_data.get('created_at'),
                }
            )
    except Exception:
        # Silencieux si Channels/Daphne n'est pas actif dans l'environnement local
        pass


def ensure_default_channels(club_id: int = 1) -> list[ChatChannel]:
    """
    Garantit l'existence de salons par défaut pour un club.
    Si le club n'a aucun salon, crée les salons de base indispensables.
    """
    existing = ChatChannel.objects.filter(club_id=club_id, is_active=True)
    if existing.exists():
        return list(existing)

    defaults = [
        {
            'name': 'general',
            'channel_type': ChannelType.PUBLIC,
            'description': 'Discussions générales, vie du club et informations partagées.',
        },
        {
            'name': 'annonces-officielles',
            'channel_type': ChannelType.PUBLIC,
            'description': 'Communications officielles du bureau, convocations et événements majeurs.',
        },
        {
            'name': 'staff-technique',
            'channel_type': ChannelType.PRIVATE,
            'description': 'Coordination des entraîneurs, plannings sportifs et logistique de match.',
        },
    ]

    created_channels = []
    for d in defaults:
        c = ChatChannel.objects.create(
            club_id=club_id,
            name=d['name'],
            channel_type=d['channel_type'],
            description=d['description'],
            creator_id=1,
            is_active=True,
        )
        ChannelMembership.objects.create(
            channel=c,
            user_id=1,
            user_name='Direction du Club',
            role=MembershipRole.ADMIN,
        )
        created_channels.append(c)

    return created_channels


def create_channel(
    club_id: int,
    name: str,
    creator_id: int = 1,
    creator_name: str = 'Admin',
    channel_type: str = 'PUBLIC',
    description: str = '',
) -> ChatChannel:
    """Crée un nouveau salon de discussion et ajoute le créateur comme ADMIN."""
    clean_name = name.strip().lstrip('#').replace(' ', '-').lower()

    channel = ChatChannel.objects.create(
        club_id=club_id,
        name=clean_name,
        channel_type=channel_type,
        description=description,
        creator_id=creator_id,
        is_active=True,
    )
    ChannelMembership.objects.create(
        channel=channel,
        user_id=creator_id,
        user_name=creator_name or 'Admin',
        role=MembershipRole.ADMIN,
    )
    return channel


def update_channel(
    channel: ChatChannel,
    name: Optional[str] = None,
    description: Optional[str] = None,
    channel_type: Optional[str] = None,
) -> ChatChannel:
    """Met à jour les informations d'un salon."""
    if name is not None:
        channel.name = name.strip().lstrip('#').replace(' ', '-').lower()
    if description is not None:
        channel.description = description.strip()
    if channel_type is not None:
        channel.channel_type = channel_type
    channel.save()
    return channel


def delete_channel(channel: ChatChannel) -> None:
    """Supprime un salon et ses messages associés (soft-delete ou suppression réelle)."""
    channel.delete()


def add_member(
    channel: ChatChannel,
    user_id: int,
    user_name: str = '',
    role: str = MembershipRole.MEMBER,
) -> ChannelMembership:
    """Ajoute un membre à un salon ou met à jour son rôle s'il est déjà présent."""
    membership, _ = ChannelMembership.objects.get_or_create(
        channel=channel,
        user_id=user_id,
        defaults={'user_name': user_name, 'role': role},
    )
    return membership


def remove_member(channel: ChatChannel, user_id: int) -> None:
    """Retire un membre d'un salon."""
    ChannelMembership.objects.filter(channel=channel, user_id=user_id).delete()


def send_channel_message(
    channel: ChatChannel,
    sender_id: int,
    sender_name: str,
    content: str = '',
    attachment_url: str = None,
) -> ChannelMessage:
    """
    Envoie un message dans un salon :
    1. Sauvegarde dans la base de données.
    2. Diffuse sur le WebSocket ChannelLayer aux autres utilisateurs en direct.
    """
    message = ChannelMessage.objects.create(
        channel=channel,
        sender_id=sender_id,
        sender_name=sender_name,
        content=content,
        attachment_url=attachment_url,
    )

    # Diffusion en direct
    _broadcast_to_channel_layer(
        channel_id=channel.id,
        message_data={
            'id': message.id,
            'content': message.content,
            'sender_id': message.sender_id,
            'sender_name': message.sender_name,
            'attachment_url': message.attachment_url,
            'is_pinned': message.is_pinned,
            'created_at': message.created_at.isoformat() if message.created_at else None,
        }
    )

    return message


def toggle_pin_message(message_id: int) -> ChannelMessage | None:
    """Épingle ou désépingle un message."""
    try:
        msg = ChannelMessage.objects.get(id=message_id)
        msg.is_pinned = not msg.is_pinned
        msg.save()
        return msg
    except ChannelMessage.DoesNotExist:
        return None


def delete_message(message_id: int) -> bool:
    """Supprime un message par son ID."""
    count, _ = ChannelMessage.objects.filter(id=message_id).delete()
    return count > 0
