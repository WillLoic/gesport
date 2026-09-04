"""
URL configuration for config project.

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

urlpatterns = [
    path('admin/', admin.site.urls),

    # Routage API v1 par domaine métier
    path('api/v1/auth/', include('apps.iam.urls')),
    path('api/v1/members/', include('apps.members.urls')),
    path('api/v1/sport/', include('apps.sport_performance.urls')),
    path('api/v1/medical/', include('apps.medical.urls')),
    path('api/v1/finances/', include('apps.finance_ledger.urls')),
    path('api/v1/invoicing/', include('apps.invoicing.urls')),
    path('api/v1/sponsors/', include('apps.sponsorship.urls')),
    path('api/v1/inventory/', include('apps.inventory.urls')),
    path('api/v1/fleet/', include('apps.fleet.urls')),
    path('api/v1/hr/', include('apps.staff_hr.urls')),
    path('api/v1/shop/', include('apps.shop_merch.urls')),
    path('api/v1/communication/', include('apps.communication.urls')),
    path('api/v1/messaging/', include('apps.messaging.urls')),
]
