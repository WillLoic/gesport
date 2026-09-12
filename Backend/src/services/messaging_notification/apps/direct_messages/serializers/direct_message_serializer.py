from rest_framework import serializers
from apps.direct_messages.models import Conversation, DirectMessage


class DirectMessageSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = DirectMessage
        fields = ['id', 'conversation', 'sender_id', 'recipient_id', 'content', 'attachment_url', 'status', 'status_display', 'read_at', 'created_at']
        read_only_fields = ['id', 'status', 'read_at', 'created_at']


class ConversationSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'participant1_id', 'participant1_name', 'participant2_id', 'participant2_name', 'last_message', 'last_message_at', 'created_at']
        read_only_fields = ['id', 'last_message_at', 'created_at']

    def get_last_message(self, obj):
        msg = obj.messages.order_by('-created_at').first()
        if msg:
            return DirectMessageSerializer(msg).data
        return None

