from django.utils import timezone
from apps.notifications.models import Notification, NotificationStatus


def create_notification(
    club_id: int,
    user_id: int,
    title: str,
    message: str,
    category: str = 'SYSTEM',
    level: str = 'INFO',
    action_url: str = None,
) -> Notification:
    """Crée une nouvelle notification pour un utilisateur."""
    return Notification.objects.create(
        club_id=club_id,
        user_id=user_id,
        title=title,
        message=message,
        category=category,
        level=level,
        action_url=action_url,
        status=NotificationStatus.UNREAD,
    )


def mark_as_read(notification_id: int) -> Notification | None:
    """Marque une notification comme lue. Retourne la notification ou None."""
    try:
        notification = Notification.objects.get(id=notification_id)
        if notification.status == NotificationStatus.UNREAD:
            notification.status = NotificationStatus.READ
            notification.read_at = timezone.now()
            notification.save(update_fields=['status', 'read_at'])
        return notification
    except Notification.DoesNotExist:
        return None


def mark_all_as_read(user_id: int) -> int:
    """
    Marque toutes les notifications non lues d'un utilisateur comme lues.
    Retourne le nombre de notifications mises à jour.
    """
    now = timezone.now()
    updated = Notification.objects.filter(
        user_id=user_id,
        status=NotificationStatus.UNREAD,
    ).update(status=NotificationStatus.READ, read_at=now)
    return updated


def count_unread(user_id: int) -> int:
    """Compte le nombre de notifications non lues pour un utilisateur."""
    return Notification.objects.filter(
        user_id=user_id,
        status=NotificationStatus.UNREAD,
    ).count()
