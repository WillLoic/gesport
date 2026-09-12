from django.db import models


class NotificationCategory(models.TextChoices):
    SYSTEM = 'SYSTEM', 'Système'
    CHAT = 'CHAT', 'Chat'
    SPORT = 'SPORT', 'Sport'
    FINANCE = 'FINANCE', 'Finance'


class NotificationLevel(models.TextChoices):
    INFO = 'INFO', 'Information'
    WARNING = 'WARNING', 'Avertissement'
    URGENT = 'URGENT', 'Urgent'


class NotificationStatus(models.TextChoices):
    UNREAD = 'UNREAD', 'Non lu'
    READ = 'READ', 'Lu'


class Notification(models.Model):
    club_id = models.BigIntegerField(db_index=True)
    user_id = models.BigIntegerField(db_index=True)
    title = models.CharField(max_length=255)
    message = models.TextField()
    category = models.CharField(
        max_length=20, choices=NotificationCategory.choices, default=NotificationCategory.SYSTEM
    )
    level = models.CharField(
        max_length=10, choices=NotificationLevel.choices, default=NotificationLevel.INFO
    )
    status = models.CharField(
        max_length=10, choices=NotificationStatus.choices, default=NotificationStatus.UNREAD
    )
    action_url = models.URLField(max_length=500, blank=True, null=True)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'msg_notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.level}] {self.title} → User#{self.user_id}"
