from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/chat/', include('apps.chat.urls')),
    path('api/direct-messages/', include('apps.direct_messages.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
]
