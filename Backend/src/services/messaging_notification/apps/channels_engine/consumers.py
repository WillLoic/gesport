import json
try:
    from channels.generic.websocket import AsyncWebsocketConsumer
    from channels.db import database_sync_to_async
except ImportError:
    # Fallback classe factice si channels n'est pas installé dans l'environnement local
    class AsyncWebsocketConsumer:
        pass
    def database_sync_to_async(func):
        return func


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
        """Reçoit un message du client WebSocket, le sauvegarde en BD et le diffuse au groupe."""
        try:
            data = json.loads(text_data)
            content = data.get('content') or data.get('message', '')
            sender_id = data.get('sender_id', 1)
            sender_name = data.get('sender_name', 'Membre du Club')
            attachment_url = data.get('attachment_url')

            if not content.strip() and not attachment_url:
                return

            from apps.chat.models import ChannelMessage, ChatChannel

            @database_sync_to_async
            def save_msg():
                try:
                    ch = ChatChannel.objects.get(id=int(self.channel_id))
                    return ChannelMessage.objects.create(
                        channel=ch,
                        sender_id=sender_id,
                        sender_name=sender_name,
                        content=content,
                        attachment_url=attachment_url
                    )
                except Exception:
                    return None

            msg_obj = await save_msg()
            msg_id = msg_obj.id if msg_obj else None
            created_at = msg_obj.created_at.isoformat() if msg_obj and msg_obj.created_at else None

            # Diffuser le message à tous les membres du salon
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'id': msg_id,
                    'message': content,
                    'content': content,
                    'sender_id': sender_id,
                    'sender_name': sender_name,
                    'channel_id': self.channel_id,
                    'attachment_url': attachment_url,
                    'is_pinned': False,
                    'created_at': created_at,
                }
            )
        except (json.JSONDecodeError, KeyError):
            await self.send(text_data=json.dumps({'error': 'Format de message invalide'}))

    async def chat_message(self, event):
        """Envoie un message de chat au client WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'id': event.get('id'),
            'message': event.get('message') or event.get('content', ''),
            'content': event.get('content') or event.get('message', ''),
            'sender_id': event.get('sender_id'),
            'sender_name': event.get('sender_name'),
            'channel_id': event.get('channel_id'),
            'attachment_url': event.get('attachment_url'),
            'is_pinned': event.get('is_pinned', False),
            'created_at': event.get('created_at'),
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
