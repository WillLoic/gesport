from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.chat.serializers.chat_serializer import (
    ChatChannelSerializer,
    ChannelMessageSerializer,
    ChannelMembershipSerializer
)
from apps.chat.selectors.chat_selector import (
    get_channels_for_club,
    get_channel_by_id,
    get_channel_messages
)
from apps.chat.services.chat_service import (
    create_channel,
    update_channel,
    delete_channel,
    add_member,
    remove_member,
    send_channel_message,
    delete_message,
    toggle_pin_message
)


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
                club_id=serializer.validated_data.get('club_id', 1),
                name=serializer.validated_data['name'],
                creator_id=serializer.validated_data.get('creator_id', 1),
                creator_name=request.data.get('creator_name', 'Admin'),
                channel_type=serializer.validated_data.get('channel_type', 'PUBLIC'),
                description=serializer.validated_data.get('description', ''),
            )
            return Response(ChatChannelSerializer(channel).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChatChannelDetailView(APIView):
    """GET/PUT/PATCH/DELETE /api/chat/channels/<channel_id>/"""

    def get(self, request, channel_id: int):
        channel = get_channel_by_id(channel_id)
        if not channel:
            return Response({"error": "Salon introuvable"}, status=status.HTTP_404_NOT_FOUND)
        return Response(ChatChannelSerializer(channel).data, status=status.HTTP_200_OK)

    def put(self, request, channel_id: int):
        channel = get_channel_by_id(channel_id)
        if not channel:
            return Response({"error": "Salon introuvable"}, status=status.HTTP_404_NOT_FOUND)

        updated = update_channel(
            channel=channel,
            name=request.data.get('name'),
            description=request.data.get('description'),
            channel_type=request.data.get('channel_type')
        )
        return Response(ChatChannelSerializer(updated).data, status=status.HTTP_200_OK)

    def patch(self, request, channel_id: int):
        return self.put(request, channel_id)

    def delete(self, request, channel_id: int):
        channel = get_channel_by_id(channel_id)
        if not channel:
            return Response({"error": "Salon introuvable"}, status=status.HTTP_404_NOT_FOUND)
        delete_channel(channel)
        return Response({"message": f"Salon #{channel.name} supprimé avec succès."}, status=status.HTTP_200_OK)


class ChannelMessageListCreateView(APIView):
    """GET/POST /api/chat/channels/<channel_id>/messages/"""

    def get(self, request, channel_id: int):
        since_id = request.query_params.get('since_id')
        parsed_since = int(since_id) if since_id and since_id.isdigit() else None

        messages = get_channel_messages(channel_id=channel_id, since_id=parsed_since)
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
                sender_id=serializer.validated_data.get('sender_id', 1),
                sender_name=serializer.validated_data.get('sender_name', 'Membre du Club'),
                content=serializer.validated_data.get('content', ''),
                attachment_url=serializer.validated_data.get('attachment_url'),
            )
            return Response(ChannelMessageSerializer(message).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChannelMessageDetailView(APIView):
    """PATCH/DELETE /api/chat/messages/<message_id>/"""

    def patch(self, request, message_id: int):
        """Toggle pin du message"""
        msg = toggle_pin_message(message_id)
        if not msg:
            return Response({"error": "Message introuvable"}, status=status.HTTP_404_NOT_FOUND)
        return Response(ChannelMessageSerializer(msg).data, status=status.HTTP_200_OK)

    def delete(self, request, message_id: int):
        """Supprime un message"""
        success = delete_message(message_id)
        if not success:
            return Response({"error": "Message introuvable"}, status=status.HTTP_404_NOT_FOUND)
        return Response({"message": "Message supprimé."}, status=status.HTTP_200_OK)


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
        return Response({"status": "Membre retiré"}, status=status.HTTP_200_OK)
