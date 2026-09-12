from django.urls import path
from apps.direct_messages.views.direct_message_view import (
    ConversationListView, DirectMessageListCreateView, DirectMessageMarkReadView
)

urlpatterns = [
    path('conversations/', ConversationListView.as_view(), name='conversations-list'),
    path('messages/', DirectMessageListCreateView.as_view(), name='direct-messages-list-create'),
    path('conversations/<int:conversation_id>/read/', DirectMessageMarkReadView.as_view(), name='conversations-mark-read'),
]

