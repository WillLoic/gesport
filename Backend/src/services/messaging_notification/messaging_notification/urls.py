from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # Endpoints v1 (routage via API Gateway)
    path('api/v1/chat/', include('apps.chat.urls')),
    path('api/v1/direct-messages/', include('apps.direct_messages.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),

    # Compatibilité directe /api/
    path('api/chat/', include('apps.chat.urls')),
    path('api/direct-messages/', include('apps.direct_messages.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
]
