from django.urls import path
from .views import (
    PurchaseOrderListCreateView,
    PurchaseOrderDetailView,
    PurchaseOrderValidateView,
)

urlpatterns = [
    path('orders/', PurchaseOrderListCreateView.as_view(), name='purchase-order-list-create'),
    path('orders/<int:pk>/', PurchaseOrderDetailView.as_view(), name='purchase-order-detail'),
    path('orders/<int:pk>/validate/', PurchaseOrderValidateView.as_view(), name='purchase-order-validate'),
]
