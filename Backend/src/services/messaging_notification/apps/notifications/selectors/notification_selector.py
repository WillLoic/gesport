from apps.notifications.models import Notification, NotificationStatus


def get_notifications_for_user(user_id: int, status_filter: str = None):
    """Retourne les notifications d'un utilisateur, filtrables par statut."""
    qs = Notification.objects.filter(user_id=user_id)
    if status_filter:
        qs = qs.filter(status=status_filter)
    return qs.order_by('-created_at')


def get_notification_by_id(notification_id: int) -> Notification | None:
    """Retourne une notification par son ID ou None."""
    try:
        return Notification.objects.get(id=notification_id)
    except Notification.DoesNotExist:
        return None
