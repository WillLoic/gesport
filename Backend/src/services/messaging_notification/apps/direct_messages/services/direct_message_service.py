from django.utils import timezone
from apps.direct_messages.models import Conversation, DirectMessage, MessageStatus


def get_or_create_conversation(
    participant1_id: int,
    participant1_name: str,
    participant2_id: int,
    participant2_name: str,
) -> Conversation:
    """
    Retourne ou crée une conversation entre deux participants.
    Garantit l'ordre canonique (participant1_id < participant2_id) pour éviter les doublons.
    """
    # Ordre canonique pour éviter les doublons (A<->B == B<->A)
    if participant1_id > participant2_id:
        participant1_id, participant2_id = participant2_id, participant1_id
        participant1_name, participant2_name = participant2_name, participant1_name

    conversation, _ = Conversation.objects.get_or_create(
        participant1_id=participant1_id,
        participant2_id=participant2_id,
        defaults={
            'participant1_name': participant1_name,
            'participant2_name': participant2_name,
        },
    )
    return conversation


def send_direct_message(
    conversation: Conversation,
    sender_id: int,
    recipient_id: int,
    content: str,
    attachment_url: str = None,
) -> DirectMessage:
    """Envoie un message privé et met à jour le timestamp de la conversation."""
    message = DirectMessage.objects.create(
        conversation=conversation,
        sender_id=sender_id,
        recipient_id=recipient_id,
        content=content,
        attachment_url=attachment_url,
        status=MessageStatus.SENT,
    )
    # Met à jour le timestamp de la conversation
    conversation.last_message_at = message.created_at
    conversation.save(update_fields=['last_message_at'])
    return message


def mark_messages_as_read(conversation_id: int, recipient_id: int) -> int:
    """
    Marque tous les messages non lus d'une conversation comme READ.
    Retourne le nombre de messages mis à jour.
    """
    now = timezone.now()
    updated = DirectMessage.objects.filter(
        conversation_id=conversation_id,
        recipient_id=recipient_id,
        status=MessageStatus.SENT,
    ).update(status=MessageStatus.READ, read_at=now)
    return updated
