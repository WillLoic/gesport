from django.urls import path
from apps.chat.views.chat_view import ChatChannelListCreateView, ChannelMessageListCreateView, ChannelMemberAddRemoveView

urlpatterns = [
    path('channels/', ChatChannelListCreateView.as_view(), name='chat-channels-list-create'),
    path('channels/<int:channel_id>/messages/', ChannelMessageListCreateView.as_view(), name='chat-messages-list-create'),
    path('channels/<int:channel_id>/members/', ChannelMemberAddRemoveView.as_view(), name='chat-members-add-remove'),
]

