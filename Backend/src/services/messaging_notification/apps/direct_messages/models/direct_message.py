from django.db import models
from apps.direct_messages.models.conversation import Conversation


class MessageStatus(models.TextChoices):
    SENT = 'SENT', 'Envoyé'
    READ = 'READ', 'Lu'


class DirectMessage(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender_id = models.BigIntegerField(db_index=True)
    recipient_id = models.BigIntegerField(db_index=True)
    content = models.TextField()
    attachment_url = models.URLField(max_length=500, blank=True, null=True)
    status = models.CharField(max_length=10, choices=MessageStatus.choices, default=MessageStatus.SENT)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'msg_direct_messages'
        ordering = ['created_at']

    def __str__(self):
        return f"DM de User#{self.sender_id} à User#{self.recipient_id} ({self.status})"
