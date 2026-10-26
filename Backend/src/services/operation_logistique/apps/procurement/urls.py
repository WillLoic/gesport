from django.urls import path
from .views import (
    PurchaseOrderListCreateView,
    PurchaseOrderDetailView,
    PurchaseOrderValidateView,
    PurchaseOrderPDFView,
)

urlpatterns = [
    path('orders/', PurchaseOrderListCreateView.as_view(), name='purchase-order-list-create'),
    path('orders/<int:pk>/', PurchaseOrderDetailView.as_view(), name='purchase-order-detail'),
    path('orders/<int:pk>/validate/', PurchaseOrderValidateView.as_view(), name='purchase-order-validate'),
    path('orders/<int:pk>/pdf/', PurchaseOrderPDFView.as_view(), name='purchase-order-pdf'),
]
