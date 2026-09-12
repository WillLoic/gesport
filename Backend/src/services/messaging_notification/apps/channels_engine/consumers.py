import json
from channels.generic.websocket import AsyncWebsocketConsumer


class ChatConsumer(AsyncWebsocketConsumer):
    """
    Consumer WebSocket pour les salons de discussion en temps réel.
    URL: ws://host/ws/chat/<channel_id>/
    """

    async def connect(self):
        self.channel_id = self.scope['url_route']['kwargs']['channel_id']
        self.room_group_name = f'chat_{self.channel_id}'

        # Rejoindre le groupe du salon
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Quitter le groupe du salon
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )

    async def receive(self, text_data):
        """Reçoit un message du client WebSocket et le diffuse au groupe."""
        try:
            data = json.loads(text_data)
            message = data.get('message', '')
            sender_id = data.get('sender_id', 0)
            sender_name = data.get('sender_name', 'Anonyme')

            # Diffuser le message à tous les membres du salon
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'sender_id': sender_id,
                    'sender_name': sender_name,
                    'channel_id': self.channel_id,
                }
            )
        except (json.JSONDecodeError, KeyError):
            await self.send(text_data=json.dumps({'error': 'Format de message invalide'}))

    async def chat_message(self, event):
        """Envoie un message de chat au client WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message'],
            'sender_id': event['sender_id'],
            'sender_name': event['sender_name'],
            'channel_id': event['channel_id'],
        }))


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    Consumer WebSocket pour les notifications in-app en temps réel.
    URL: ws://host/ws/notifications/<user_id>/
    """

    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.notification_group = f'notifications_{self.user_id}'

        # Rejoindre le groupe de notifications de l'utilisateur
        await self.channel_layer.group_add(
            self.notification_group,
            self.channel_name,
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.notification_group,
            self.channel_name,
        )

    async def receive(self, text_data):
        """Le client peut envoyer un ACK de lecture."""
        pass

    async def send_notification(self, event):
        """Pousse une notification in-app au client WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'title': event.get('title', ''),
            'message': event.get('message', ''),
            'level': event.get('level', 'INFO'),
            'category': event.get('category', 'SYSTEM'),
            'action_url': event.get('action_url', ''),
            'notification_id': event.get('notification_id'),
        }))
