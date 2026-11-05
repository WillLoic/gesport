"""
URL configuration for documents_coffrefort project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # Endpoints v1 (routage via API Gateway Nginx)
    path('api/v1/vault/', include('apps.vault.urls')),
    path('api/v1/governance/', include('apps.governance.urls')),
    path('api/v1/hr-contracts/', include('apps.hr_contracts.urls')),
    path('api/v1/signatures/', include('apps.signatures.urls')),

    # Compatibilité directe /api/
    # path('api/vault/', include('apps.vault.urls')),
    # path('api/governance/', include('apps.governance.urls')),
    # path('api/hr-contracts/', include('apps.hr_contracts.urls')),
    # path('api/signatures/', include('apps.signatures.urls')),
]

# Serving des fichiers media en développement local (simulation S3)
# En production, cette partie est gérée par AWS S3 / CloudFront
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
