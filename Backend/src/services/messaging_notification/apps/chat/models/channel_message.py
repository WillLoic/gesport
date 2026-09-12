from django.db import models
from apps.chat.models.channel import ChatChannel


class ChannelMessage(models.Model):
    channel = models.ForeignKey(ChatChannel, on_delete=models.CASCADE, related_name='messages')
    sender_id = models.BigIntegerField(db_index=True)
    sender_name = models.CharField(max_length=150)
    content = models.TextField()
    attachment_url = models.URLField(max_length=500, blank=True, null=True)
    is_pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'msg_channel_messages'
        ordering = ['created_at']

    def __str__(self):
        return f"Message de {self.sender_name} dans #{self.channel.name}"
