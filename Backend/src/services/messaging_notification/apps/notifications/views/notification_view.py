from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.notifications.serializers.notification_serializer import NotificationSerializer
from apps.notifications.selectors.notification_selector import (
    get_notifications_for_user, get_notification_by_id
)
from apps.notifications.services.notification_service import (
    create_notification, mark_as_read, mark_all_as_read, count_unread
)


class NotificationListCreateView(APIView):
    """GET/POST /api/notifications/"""

    def get(self, request):
        user_id = request.query_params.get('user_id', 1)
        status_filter = request.query_params.get('status')
        notifications = get_notifications_for_user(
            user_id=int(user_id), status_filter=status_filter
        )
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data
        required_fields = ['club_id', 'user_id', 'title', 'message']
        for field in required_fields:
            if not data.get(field):
                return Response(
                    {"error": f"{field} est requis"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        notification = create_notification(
            club_id=int(data['club_id']),
            user_id=int(data['user_id']),
            title=data['title'],
            message=data['message'],
            category=data.get('category', 'SYSTEM'),
            level=data.get('level', 'INFO'),
            action_url=data.get('action_url'),
        )
        return Response(NotificationSerializer(notification).data, status=status.HTTP_201_CREATED)


class NotificationUnreadCountView(APIView):
    """GET /api/notifications/unread-count/"""

    def get(self, request):
        user_id = request.query_params.get('user_id', 1)
        unread = count_unread(user_id=int(user_id))
        return Response({"user_id": int(user_id), "unread_count": unread}, status=status.HTTP_200_OK)


class NotificationMarkReadView(APIView):
    """POST /api/notifications/<pk>/read/"""

    def post(self, request, pk: int):
        notification = mark_as_read(notification_id=pk)
        if not notification:
            return Response({"error": "Notification introuvable"}, status=status.HTTP_404_NOT_FOUND)
        return Response(NotificationSerializer(notification).data, status=status.HTTP_200_OK)


class NotificationMarkAllReadView(APIView):
    """POST /api/notifications/read-all/"""

    def post(self, request):
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({"error": "user_id requis"}, status=status.HTTP_400_BAD_REQUEST)

        updated_count = mark_all_as_read(user_id=int(user_id))
        return Response(
            {"status": "OK", "notifications_marquées_lues": updated_count},
            status=status.HTTP_200_OK
        )
