"""
URL racine du microservice marketing_cms (#07).

Routage vers les 3 sous-applications :
  - /api/v1/cms/news/
  - /api/v1/cms/campaigns/
  - /api/v1/cms/ticketing/
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/cms/news/', include('apps.news.urls')),
    path('api/v1/cms/campaigns/', include('apps.campaigns.urls')),
    path('api/v1/cms/ticketing/', include('apps.ticketing.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
