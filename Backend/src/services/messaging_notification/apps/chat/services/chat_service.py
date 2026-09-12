from apps.chat.models import ChatChannel, ChannelMembership, ChannelMessage, MembershipRole


def create_channel(
    club_id: int,
    name: str,
    creator_id: int,
    creator_name: str = '',
    channel_type: str = 'PUBLIC',
    description: str = '',
) -> ChatChannel:
    """Crée un nouveau salon de discussion et ajoute le créateur comme ADMIN."""
    channel = ChatChannel.objects.create(
        club_id=club_id,
        name=name,
        channel_type=channel_type,
        description=description,
        creator_id=creator_id,
        is_active=True,
    )
    # Le créateur est automatiquement ajouté en tant qu'ADMIN
    ChannelMembership.objects.create(
        channel=channel,
        user_id=creator_id,
        user_name=creator_name,
        role=MembershipRole.ADMIN,
    )
    return channel


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
    content: str,
    attachment_url: str = None,
) -> ChannelMessage:
    """Envoie un message dans un salon."""
    return ChannelMessage.objects.create(
        channel=channel,
        sender_id=sender_id,
        sender_name=sender_name,
        content=content,
        attachment_url=attachment_url,
    )


def delete_message(message_id: int) -> None:
    """Supprime un message par son ID."""
    ChannelMessage.objects.filter(id=message_id).delete()
