"""Routes URL pour les paniers et commandes."""

from django.urls import path
from apps.orders.views import (
    CartView,
    CartItemDetailView,
    OrderListCreateView,
    OrderDetailView,
    OrderStatusUpdateView,
)

urlpatterns = [
    # Paniers
    path('cart/', CartView.as_view(), name='orders-cart'),
    path('cart/items/<int:pk>/', CartItemDetailView.as_view(), name='orders-cart-item-detail'),

    # Commandes
    path('', OrderListCreateView.as_view(), name='orders-list-create'),
    path('<str:identifier>/', OrderDetailView.as_view(), name='orders-detail'),
    path('<int:pk>/status/', OrderStatusUpdateView.as_view(), name='orders-update-status'),
]
