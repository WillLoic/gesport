from django.db import models
from django.utils import timezone


class Conversation(models.Model):
    participant1_id = models.BigIntegerField(db_index=True)
    participant1_name = models.CharField(max_length=150, blank=True, default='')
    participant2_id = models.BigIntegerField(db_index=True)
    participant2_name = models.CharField(max_length=150, blank=True, default='')
    last_message_at = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'msg_conversations'
        # Garantit l'unicité d'une conversation entre deux participants
        unique_together = [['participant1_id', 'participant2_id']]
        ordering = ['-last_message_at']

    def __str__(self):
        return f"Conversation entre User#{self.participant1_id} et User#{self.participant2_id}"
