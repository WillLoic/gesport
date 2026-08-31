from django.urls import path
from apps.inventory.views.inventory_view import (
    StorageLocationListCreateView,
    EquipmentItemListCreateView,
    EquipmentItemDetailView,
    EquipmentStockAlertsView
)

urlpatterns = [
    path('locations/', StorageLocationListCreateView.as_view(), name='inventory-location-list-create'),
    path('equipments/', EquipmentItemListCreateView.as_view(), name='inventory-equipment-list-create'),
    path('equipments/<int:pk>/', EquipmentItemDetailView.as_view(), name='inventory-equipment-detail'),
    path('alerts/', EquipmentStockAlertsView.as_view(), name='inventory-stock-alerts'),
]
