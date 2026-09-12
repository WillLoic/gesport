"""URL configuration for ecommerce_merchandising service."""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/shop/catalog/', include('apps.catalog.urls')),
    path('api/v1/shop/inventory/', include('apps.inventory_variants.urls')),
    path('api/v1/shop/custom-prints/', include('apps.custom_prints.urls')),
    path('api/v1/shop/orders/', include('apps.orders.urls')),
    path('api/v1/shop/payments/', include('apps.payments.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
