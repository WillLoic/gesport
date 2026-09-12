from rest_framework import serializers
from apps.notifications.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id', 'club_id', 'user_id', 'title', 'message',
            'category', 'category_display', 'level', 'level_display',
            'status', 'status_display', 'action_url', 'read_at', 'created_at'
        ]
        read_only_fields = ['id', 'status', 'read_at', 'created_at']

