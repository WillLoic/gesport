"""
ASGI config for messaging_notification project.
Microservice #06 | Port: 8006 | DB: chat_db

Intègre Django Channels pour le support WebSockets temps réel.
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'messaging_notification.settings')

# Initialiser Django avant d'importer les consumers
django_asgi_app = get_asgi_application()

from apps.channels_engine.routing import websocket_urlpatterns  # noqa: E402

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})
