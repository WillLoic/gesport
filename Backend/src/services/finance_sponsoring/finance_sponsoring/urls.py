from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/finance/ledger/', include('apps.ledger.urls')),
    path('api/v1/finance/invoicing/', include('apps.invoicing.urls')),
    path('api/v1/finance/banking/', include('apps.banking.urls')),
    path('api/v1/finance/tax-receipts/', include('apps.tax_receipts.urls')),
    path('api/v1/finance/sponsors/', include('apps.sponsors.urls')),
]
