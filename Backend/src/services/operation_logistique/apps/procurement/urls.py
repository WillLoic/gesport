from django.urls import path
from apps.procurement.views.procurement_view import (
    SupplierListCreateView, PurchaseOrderListCreateView, PurchaseOrderUpdateStatusView
)

urlpatterns = [
    path('suppliers/', SupplierListCreateView.as_view(), name='supplier-list-create'),
    path('purchase-orders/', PurchaseOrderListCreateView.as_view(), name='po-list-create'),
    path('purchase-orders/<int:pk>/status/', PurchaseOrderUpdateStatusView.as_view(), name='po-update-status'),
]

