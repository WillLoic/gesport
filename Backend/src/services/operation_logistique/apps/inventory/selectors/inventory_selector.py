from typing import Optional
from django.db.models import QuerySet, F
from apps.inventory.models import EquipmentItem, StorageLocation, EquipmentStatus


def get_all_equipment(category: Optional[str] = None) -> QuerySet[EquipmentItem]:
    qs = EquipmentItem.objects.all()
    if category:
        qs = qs.filter(category=category)
    return qs


def get_equipment_by_id(equipment_id: int) -> Optional[EquipmentItem]:
    return EquipmentItem.objects.filter(id=equipment_id).first()


def get_low_stock_alerts() -> QuerySet[EquipmentItem]:
    return EquipmentItem.objects.filter(quantity_in_stock__lte=F('min_stock_threshold'))


def get_all_storage_locations() -> QuerySet[StorageLocation]:
    return StorageLocation.objects.all()
