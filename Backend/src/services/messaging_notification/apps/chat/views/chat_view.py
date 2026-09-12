from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.chat.serializers.chat_serializer import ChatChannelSerializer, ChannelMessageSerializer, ChannelMembershipSerializer
from apps.chat.selectors.chat_selector import get_channels_for_club, get_channel_by_id, get_channel_messages
from apps.chat.services.chat_service import create_channel, add_member, remove_member, send_channel_message, delete_message


class ChatChannelListCreateView(APIView):
    """GET/POST /api/chat/channels/"""

    def get(self, request):
        club_id = request.query_params.get('club_id', 1)
        channels = get_channels_for_club(club_id=int(club_id))
        serializer = ChatChannelSerializer(channels, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ChatChannelSerializer(data=request.data)
        if serializer.is_valid():
            channel = create_channel(
                club_id=serializer.validated_data['club_id'],
                name=serializer.validated_data['name'],
                creator_id=serializer.validated_data.get('creator_id', 1),
                creator_name=request.data.get('creator_name', 'Admin'),
                channel_type=serializer.validated_data.get('channel_type', 'PUBLIC'),
                description=serializer.validated_data.get('description', ''),
            )
            return Response(ChatChannelSerializer(channel).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChannelMessageListCreateView(APIView):
    """GET/POST /api/chat/channels/<channel_id>/messages/"""

    def get(self, request, channel_id: int):
        messages = get_channel_messages(channel_id=channel_id)
        serializer = ChannelMessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, channel_id: int):
        channel = get_channel_by_id(channel_id)
        if not channel:
            return Response({"error": "Salon introuvable"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ChannelMessageSerializer(data=request.data)
        if serializer.is_valid():
            message = send_channel_message(
                channel=channel,
                sender_id=serializer.validated_data['sender_id'],
                sender_name=serializer.validated_data['sender_name'],
                content=serializer.validated_data['content'],
                attachment_url=serializer.validated_data.get('attachment_url'),
            )
            return Response(ChannelMessageSerializer(message).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChannelMemberAddRemoveView(APIView):
    """POST/DELETE /api/chat/channels/<channel_id>/members/"""

    def post(self, request, channel_id: int):
        channel = get_channel_by_id(channel_id)
        if not channel:
            return Response({"error": "Salon introuvable"}, status=status.HTTP_404_NOT_FOUND)

        user_id = request.data.get('user_id')
        user_name = request.data.get('user_name', '')
        role = request.data.get('role', 'MEMBER')

        if not user_id:
            return Response({"error": "user_id requis"}, status=status.HTTP_400_BAD_REQUEST)

        membership = add_member(channel=channel, user_id=int(user_id), user_name=user_name, role=role)
        return Response(ChannelMembershipSerializer(membership).data, status=status.HTTP_201_CREATED)

    def delete(self, request, channel_id: int):
        channel = get_channel_by_id(channel_id)
        if not channel:
            return Response({"error": "Salon introuvable"}, status=status.HTTP_404_NOT_FOUND)

        user_id = request.data.get('user_id')
        if not user_id:
            return Response({"error": "user_id requis"}, status=status.HTTP_400_BAD_REQUEST)

        remove_member(channel=channel, user_id=int(user_id))
        return Response({"status": "Membres retiré"}, status=status.HTTP_200_OK)

