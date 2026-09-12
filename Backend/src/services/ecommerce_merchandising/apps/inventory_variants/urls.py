"""Routes URL pour les variantes et mouvements de stock."""

from django.urls import path
from apps.inventory_variants.views import (
    ProductVariantListCreateView,
    ProductVariantDetailView,
    StockAdjustmentView,
    LowStockAlertView,
    StockMovementsHistoryView,
)

urlpatterns = [
    path('products/<int:product_id>/variants/', ProductVariantListCreateView.as_view(), name='inventory-product-variants'),
    path('variants/<int:pk>/', ProductVariantDetailView.as_view(), name='inventory-variant-detail'),
    path('variants/<int:pk>/adjust-stock/', StockAdjustmentView.as_view(), name='inventory-adjust-stock'),
    path('variants/<int:pk>/movements/', StockMovementsHistoryView.as_view(), name='inventory-variant-movements'),
    path('alerts/<int:club_id>/low-stock/', LowStockAlertView.as_view(), name='inventory-low-stock-alerts'),
]
