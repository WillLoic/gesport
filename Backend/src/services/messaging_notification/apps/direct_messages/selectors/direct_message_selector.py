from apps.direct_messages.models import Conversation, DirectMessage, MessageStatus


def get_conversations_for_user(user_id: int):
    """Retourne toutes les conversations d'un utilisateur, triées par dernière activité."""
    return Conversation.objects.filter(
        participant1_id=user_id
    ) | Conversation.objects.filter(
        participant2_id=user_id
    ).order_by('-last_message_at')


def get_messages_for_conversation(conversation_id: int):
    """Retourne tous les messages d'une conversation, du plus ancien au plus récent."""
    return DirectMessage.objects.filter(conversation_id=conversation_id).order_by('created_at')


def get_unread_count_for_user(user_id: int) -> int:
    """Compte le nombre de messages non lus pour un utilisateur."""
    return DirectMessage.objects.filter(
        recipient_id=user_id,
        status=MessageStatus.SENT,
    ).count()
