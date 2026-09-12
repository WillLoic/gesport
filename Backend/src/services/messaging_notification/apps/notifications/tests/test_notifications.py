from django.test import TestCase
from apps.notifications.models import Notification, NotificationStatus
from apps.notifications.services.notification_service import (
    create_notification, mark_as_read, mark_all_as_read, count_unread
)
from apps.notifications.selectors.notification_selector import (
    get_notifications_for_user, get_notification_by_id
)


class CreateNotificationTest(TestCase):
    """Tests de création de notifications."""

    def test_create_notification_defaults(self):
        """Crée une notification avec les valeurs par défaut."""
        notif = create_notification(
            club_id=1, user_id=10, title='Bienvenue', message='Bienvenue sur GeSport !'
        )
        self.assertIsNotNone(notif.id)
        self.assertEqual(notif.status, NotificationStatus.UNREAD)
        self.assertEqual(notif.category, 'SYSTEM')
        self.assertEqual(notif.level, 'INFO')
        self.assertIsNone(notif.read_at)

    def test_create_notification_urgent(self):
        """Crée une notification urgente."""
        notif = create_notification(
            club_id=1, user_id=10, title='Alerte Match',
            message='Le match commence dans 30 min',
            category='SPORT', level='URGENT',
        )
        self.assertEqual(notif.level, 'URGENT')
        self.assertEqual(notif.category, 'SPORT')


class NotificationLifecycleTest(TestCase):
    """Tests du cycle de vie d'une notification."""

    def setUp(self):
        self.notif = create_notification(
            club_id=1, user_id=5, title='Test', message='Message test'
        )

    def test_mark_as_read(self):
        """Marquer une notification comme lue doit changer son statut et renseigner read_at."""
        updated = mark_as_read(notification_id=self.notif.id)
        self.assertEqual(updated.status, NotificationStatus.READ)
        self.assertIsNotNone(updated.read_at)

    def test_mark_as_read_idempotent(self):
        """Marquer deux fois une notification lue ne doit pas changer read_at."""
        mark_as_read(notification_id=self.notif.id)
        self.notif.refresh_from_db()
        first_read_at = self.notif.read_at

        mark_as_read(notification_id=self.notif.id)
        self.notif.refresh_from_db()
        self.assertEqual(self.notif.read_at, first_read_at)

    def test_mark_as_read_not_found(self):
        """Retourne None pour un ID inexistant."""
        result = mark_as_read(notification_id=9999)
        self.assertIsNone(result)


class MarkAllAsReadTest(TestCase):
    """Tests de marquage global."""

    def setUp(self):
        for i in range(4):
            create_notification(
                club_id=1, user_id=7, title=f'Notif {i}', message=f'Msg {i}'
            )

    def test_mark_all_as_read_returns_count(self):
        """Doit retourner le nombre de notifications mises à jour."""
        updated = mark_all_as_read(user_id=7)
        self.assertEqual(updated, 4)

    def test_mark_all_as_read_clears_unread(self):
        """Après mark_all_as_read, le compteur non-lu doit être zéro."""
        mark_all_as_read(user_id=7)
        self.assertEqual(count_unread(user_id=7), 0)


class CountUnreadTest(TestCase):
    """Tests du compteur de notifications non lues."""

    def test_count_unread(self):
        """Le compteur doit refléter uniquement les notifications UNREAD."""
        create_notification(club_id=1, user_id=3, title='N1', message='M1')
        create_notification(club_id=1, user_id=3, title='N2', message='M2')
        notif3 = create_notification(club_id=1, user_id=3, title='N3', message='M3')
        mark_as_read(notification_id=notif3.id)

        self.assertEqual(count_unread(user_id=3), 2)

    def test_count_unread_zero_for_unknown_user(self):
        """Un utilisateur sans notifications doit avoir un compteur à 0."""
        self.assertEqual(count_unread(user_id=9999), 0)
