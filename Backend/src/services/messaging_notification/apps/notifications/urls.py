from django.urls import path
from apps.notifications.views.notification_view import (
    NotificationListCreateView, NotificationUnreadCountView,
    NotificationMarkReadView, NotificationMarkAllReadView
)

urlpatterns = [
    path('', NotificationListCreateView.as_view(), name='notifications-list-create'),
    path('unread-count/', NotificationUnreadCountView.as_view(), name='notifications-unread-count'),
    path('<int:pk>/read/', NotificationMarkReadView.as_view(), name='notifications-mark-read'),
    path('read-all/', NotificationMarkAllReadView.as_view(), name='notifications-read-all'),
]

