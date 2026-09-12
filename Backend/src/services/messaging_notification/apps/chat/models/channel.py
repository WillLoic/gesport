from django.db import models


class ChannelType(models.TextChoices):
    PUBLIC = 'PUBLIC', 'Salon Public'
    PRIVATE = 'PRIVATE', 'Salon Privé'
    TEAM = 'TEAM', 'Salon d\'Équipe'


class MembershipRole(models.TextChoices):
    ADMIN = 'ADMIN', 'Administrateur du Salon'
    MEMBER = 'MEMBER', 'Membre'


class ChatChannel(models.Model):
    club_id = models.BigIntegerField(db_index=True)
    name = models.CharField(max_length=100)
    channel_type = models.CharField(max_length=20, choices=ChannelType.choices, default=ChannelType.PUBLIC)
    description = models.TextField(blank=True, default='')
    creator_id = models.BigIntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'msg_chat_channels'
        ordering = ['name']

    def __str__(self):
        return f"#{self.name} ({self.get_channel_type_display()})"


class ChannelMembership(models.Model):
    channel = models.ForeignKey(ChatChannel, on_delete=models.CASCADE, related_name='memberships')
    user_id = models.BigIntegerField(db_index=True)
    user_name = models.CharField(max_length=150, blank=True, default='')
    role = models.CharField(max_length=20, choices=MembershipRole.choices, default=MembershipRole.MEMBER)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'msg_channel_memberships'
        unique_together = [['channel', 'user_id']]

    def __str__(self):
        return f"User #{self.user_id} dans #{self.channel.name} ({self.role})"
