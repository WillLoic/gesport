from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.direct_messages.serializers.direct_message_serializer import (
    ConversationSerializer, DirectMessageSerializer
)
from apps.direct_messages.selectors.direct_message_selector import (
    get_conversations_for_user, get_messages_for_conversation
)
from apps.direct_messages.services.direct_message_service import (
    get_or_create_conversation, send_direct_message, mark_messages_as_read
)


class ConversationListView(APIView):
    """GET /api/direct-messages/conversations/"""

    def get(self, request):
        user_id = request.query_params.get('user_id', 1)
        conversations = get_conversations_for_user(user_id=int(user_id))
        serializer = ConversationSerializer(conversations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DirectMessageListCreateView(APIView):
    """GET/POST /api/direct-messages/messages/"""

    def get(self, request):
        conversation_id = request.query_params.get('conversation_id')
        if not conversation_id:
            return Response({"error": "conversation_id requis"}, status=status.HTTP_400_BAD_REQUEST)
        messages = get_messages_for_conversation(conversation_id=int(conversation_id))
        serializer = DirectMessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data
        participant1_id = data.get('sender_id')
        participant2_id = data.get('recipient_id')

        if not participant1_id or not participant2_id:
            return Response(
                {"error": "sender_id et recipient_id sont requis"},
                status=status.HTTP_400_BAD_REQUEST
            )

        conversation = get_or_create_conversation(
            participant1_id=int(participant1_id),
            participant1_name=data.get('sender_name', ''),
            participant2_id=int(participant2_id),
            participant2_name=data.get('recipient_name', ''),
        )

        serializer = DirectMessageSerializer(data={
            'conversation': conversation.id,
            'sender_id': participant1_id,
            'recipient_id': participant2_id,
            'content': data.get('content', ''),
            'attachment_url': data.get('attachment_url'),
        })

        if serializer.is_valid():
            message = send_direct_message(
                conversation=conversation,
                sender_id=int(participant1_id),
                recipient_id=int(participant2_id),
                content=data.get('content', ''),
                attachment_url=data.get('attachment_url'),
            )
            return Response(DirectMessageSerializer(message).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DirectMessageMarkReadView(APIView):
    """POST /api/direct-messages/conversations/<conversation_id>/read/"""

    def post(self, request, conversation_id: int):
        recipient_id = request.data.get('recipient_id')
        if not recipient_id:
            return Response({"error": "recipient_id requis"}, status=status.HTTP_400_BAD_REQUEST)

        updated_count = mark_messages_as_read(
            conversation_id=conversation_id,
            recipient_id=int(recipient_id),
        )
        return Response(
            {"status": "OK", "messages_marqués_lus": updated_count},
            status=status.HTTP_200_OK
        )
