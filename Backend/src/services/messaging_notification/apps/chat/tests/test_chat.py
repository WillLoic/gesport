from django.test import TestCase
from apps.chat.models import ChatChannel, ChannelMembership, ChannelMessage
from apps.chat.services.chat_service import (
    create_channel, add_member, remove_member, send_channel_message, delete_message
)
from apps.chat.selectors.chat_selector import (
    get_channels_for_club, get_channel_by_id, get_channel_messages
)


class CreateChannelTest(TestCase):
    """Tests de création de salon."""

    def test_create_channel_creates_channel_and_admin_membership(self):
        """La création d'un salon doit automatiquement ajouter le créateur en ADMIN."""
        channel = create_channel(
            club_id=1, name='U18-Football', creator_id=10, creator_name='Coach Paul'
        )
        self.assertIsNotNone(channel.id)
        self.assertEqual(channel.club_id, 1)
        self.assertEqual(channel.name, 'U18-Football')
        self.assertTrue(channel.is_active)

        membership = ChannelMembership.objects.get(channel=channel, user_id=10)
        self.assertEqual(membership.role, 'ADMIN')
        self.assertEqual(membership.user_name, 'Coach Paul')

    def test_create_channel_with_type(self):
        """Test avec un type de salon spécifique."""
        channel = create_channel(
            club_id=1, name='Staff-Technique', creator_id=5,
            channel_type='PRIVATE', description='Canal privé staff'
        )
        self.assertEqual(channel.channel_type, 'PRIVATE')
        self.assertEqual(channel.description, 'Canal privé staff')


class MemberManagementTest(TestCase):
    """Tests de gestion des membres."""

    def setUp(self):
        self.channel = create_channel(club_id=1, name='Test', creator_id=1)

    def test_add_member(self):
        """Ajout d'un nouveau membre."""
        membership = add_member(channel=self.channel, user_id=99, user_name='Joueur Martin')
        self.assertEqual(membership.user_id, 99)
        self.assertEqual(membership.role, 'MEMBER')

    def test_add_member_idempotent(self):
        """L'ajout d'un membre déjà présent ne crée pas de doublon."""
        add_member(channel=self.channel, user_id=99)
        add_member(channel=self.channel, user_id=99)
        count = ChannelMembership.objects.filter(channel=self.channel, user_id=99).count()
        self.assertEqual(count, 1)

    def test_remove_member(self):
        """Retrait d'un membre."""
        add_member(channel=self.channel, user_id=55)
        remove_member(channel=self.channel, user_id=55)
        self.assertFalse(
            ChannelMembership.objects.filter(channel=self.channel, user_id=55).exists()
        )


class MessageModerationTest(TestCase):
    """Tests d'envoi et de suppression de messages."""

    def setUp(self):
        self.channel = create_channel(club_id=1, name='General', creator_id=1)

    def test_send_channel_message(self):
        """Envoi d'un message dans un salon."""
        msg = send_channel_message(
            channel=self.channel, sender_id=10, sender_name='Alice', content='Bonjour !'
        )
        self.assertEqual(msg.content, 'Bonjour !')
        self.assertEqual(msg.sender_id, 10)
        self.assertFalse(msg.is_pinned)

    def test_delete_message(self):
        """Suppression d'un message."""
        msg = send_channel_message(
            channel=self.channel, sender_id=10, sender_name='Alice', content='A supprimer'
        )
        delete_message(msg.id)
        self.assertFalse(ChannelMessage.objects.filter(id=msg.id).exists())


class ChatSelectorTest(TestCase):
    """Tests des sélecteurs ORM."""

    def test_get_channels_for_club(self):
        """Doit retourner uniquement les salons actifs du club."""
        create_channel(club_id=42, name='Canal1', creator_id=1)
        create_channel(club_id=42, name='Canal2', creator_id=1)
        create_channel(club_id=99, name='Autre', creator_id=1)  # autre club
        channels = get_channels_for_club(club_id=42)
        self.assertEqual(channels.count(), 2)

    def test_get_channel_by_id_not_found(self):
        """Retourne None si le salon n'existe pas."""
        result = get_channel_by_id(channel_id=9999)
        self.assertIsNone(result)

    def test_get_channel_messages_ordered(self):
        """Les messages doivent être ordonnés par date d'envoi."""
        channel = create_channel(club_id=1, name='Messages', creator_id=1)
        send_channel_message(channel=channel, sender_id=1, sender_name='A', content='Premier')
        send_channel_message(channel=channel, sender_id=2, sender_name='B', content='Second')
        messages = list(get_channel_messages(channel_id=channel.id))
        self.assertEqual(messages[0].content, 'Premier')
        self.assertEqual(messages[1].content, 'Second')
