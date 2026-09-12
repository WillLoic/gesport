from django.test import TestCase
from apps.direct_messages.models import Conversation, DirectMessage, MessageStatus
from apps.direct_messages.services.direct_message_service import (
    get_or_create_conversation, send_direct_message, mark_messages_as_read
)
from apps.direct_messages.selectors.direct_message_selector import (
    get_conversations_for_user, get_messages_for_conversation, get_unread_count_for_user
)


class ConversationCreationTest(TestCase):
    """Tests de création et récupération de conversations."""

    def test_get_or_create_conversation_creates_new(self):
        """Doit créer une nouvelle conversation entre deux utilisateurs."""
        conv = get_or_create_conversation(
            participant1_id=1, participant1_name='Alice',
            participant2_id=2, participant2_name='Bob',
        )
        self.assertIsNotNone(conv.id)
        # Ordre canonique : participant1_id < participant2_id
        self.assertEqual(conv.participant1_id, 1)
        self.assertEqual(conv.participant2_id, 2)

    def test_get_or_create_conversation_idempotent(self):
        """Deux appels avec les mêmes participants doivent retourner la même conversation."""
        conv1 = get_or_create_conversation(
            participant1_id=3, participant1_name='Alice',
            participant2_id=5, participant2_name='Bob',
        )
        conv2 = get_or_create_conversation(
            participant1_id=5, participant1_name='Bob',
            participant2_id=3, participant2_name='Alice',
        )
        self.assertEqual(conv1.id, conv2.id)
        self.assertEqual(Conversation.objects.count(), 1)

    def test_canonical_order_applied(self):
        """L'ordre canonique doit toujours placer le plus petit ID en participant1."""
        conv = get_or_create_conversation(
            participant1_id=10, participant1_name='Z',
            participant2_id=2, participant2_name='A',
        )
        self.assertLess(conv.participant1_id, conv.participant2_id)


class SendDirectMessageTest(TestCase):
    """Tests d'envoi de messages privés."""

    def setUp(self):
        self.conv = get_or_create_conversation(
            participant1_id=1, participant1_name='Alice',
            participant2_id=2, participant2_name='Bob',
        )

    def test_send_direct_message_creates_message(self):
        """Envoi d'un message privé."""
        msg = send_direct_message(
            conversation=self.conv,
            sender_id=1, recipient_id=2,
            content='Salut Bob !',
        )
        self.assertEqual(msg.content, 'Salut Bob !')
        self.assertEqual(msg.status, MessageStatus.SENT)
        self.assertIsNone(msg.read_at)

    def test_send_direct_message_updates_conversation_timestamp(self):
        """L'envoi d'un message doit mettre à jour last_message_at de la conversation."""
        old_ts = self.conv.last_message_at
        send_direct_message(
            conversation=self.conv, sender_id=1, recipient_id=2, content='Test'
        )
        self.conv.refresh_from_db()
        self.assertGreaterEqual(self.conv.last_message_at, old_ts)


class MarkAsReadTest(TestCase):
    """Tests du suivi de lecture."""

    def setUp(self):
        self.conv = get_or_create_conversation(
            participant1_id=1, participant1_name='Alice',
            participant2_id=2, participant2_name='Bob',
        )
        # Alice envoie 3 messages à Bob
        for i in range(3):
            send_direct_message(
                conversation=self.conv, sender_id=1, recipient_id=2, content=f'Message {i}'
            )

    def test_mark_messages_as_read(self):
        """Marquer tous les messages comme lus pour le recipient."""
        updated = mark_messages_as_read(conversation_id=self.conv.id, recipient_id=2)
        self.assertEqual(updated, 3)

        # Vérifier que tous les messages sont marqués READ
        unread = DirectMessage.objects.filter(
            conversation=self.conv,
            status=MessageStatus.SENT,
        ).count()
        self.assertEqual(unread, 0)

    def test_mark_as_read_sets_read_at(self):
        """read_at doit être renseigné après marquage."""
        mark_messages_as_read(conversation_id=self.conv.id, recipient_id=2)
        messages = DirectMessage.objects.filter(conversation=self.conv)
        for msg in messages:
            self.assertIsNotNone(msg.read_at)

    def test_unread_count_decreases_after_read(self):
        """Le compteur de messages non lus doit diminuer après marquage."""
        count_before = get_unread_count_for_user(user_id=2)
        self.assertEqual(count_before, 3)

        mark_messages_as_read(conversation_id=self.conv.id, recipient_id=2)
        count_after = get_unread_count_for_user(user_id=2)
        self.assertEqual(count_after, 0)
