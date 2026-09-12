from rest_framework import serializers
from apps.chat.models import ChatChannel, ChannelMembership, ChannelMessage


class ChannelMembershipSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = ChannelMembership
        fields = ['id', 'user_id', 'user_name', 'role', 'role_display', 'joined_at']
        read_only_fields = ['id', 'joined_at']


class ChatChannelSerializer(serializers.ModelSerializer):
    channel_type_display = serializers.CharField(source='get_channel_type_display', read_only=True)
    memberships = ChannelMembershipSerializer(many=True, read_only=True)

    class Meta:
        model = ChatChannel
        fields = [
            'id', 'club_id', 'name', 'channel_type', 'channel_type_display',
            'description', 'creator_id', 'is_active', 'memberships', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ChannelMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChannelMessage
        fields = ['id', 'channel', 'sender_id', 'sender_name', 'content', 'attachment_url', 'is_pinned', 'created_at']
        read_only_fields = ['id', 'created_at']

