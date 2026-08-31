"""
URL racine du microservice sport_perf (#02).

Routage vers les 7 sous-applications :
  - /api/v1/sport/membres/
  - /api/v1/sport/teams/
  - /api/v1/sport/competitions/
  - /api/v1/sport/tactics/
  - /api/v1/sport/academy/
  - /api/v1/sport/medical/
  - /api/v1/sport/recruitment/
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/sport/membres/', include('apps.membres.urls')),
    path('api/v1/sport/teams/', include('apps.teams.urls')),
    path('api/v1/sport/competitions/', include('apps.competitions.urls')),
    path('api/v1/sport/tactics/', include('apps.tactics.urls')),
    path('api/v1/sport/academy/', include('apps.academy.urls')),
    path('api/v1/sport/medical/', include('apps.medical.urls')),
    path('api/v1/sport/recruitment/', include('apps.recruitment.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
