from typing import Optional
from apps.inventory.models import EquipmentItem, StorageLocation, EquipmentCategory, EquipmentStatus


def create_equipment_item(
    name: str,
    category: str = EquipmentCategory.OTHER,
    quantity_in_stock: int = 0,
    min_stock_threshold: int = 5,
    location: Optional[StorageLocation] = None
) -> EquipmentItem:
    status = _determine_status(quantity_in_stock, min_stock_threshold)
    return EquipmentItem.objects.create(
        name=name,
        category=category,
        quantity_in_stock=quantity_in_stock,
        min_stock_threshold=min_stock_threshold,
        status=status,
        location=location
    )


def update_stock_quantity(item: EquipmentItem, new_quantity: int) -> EquipmentItem:
    item.quantity_in_stock = new_quantity
    item.status = _determine_status(new_quantity, item.min_stock_threshold)
    item.save()
    return item


def _determine_status(quantity: int, min_threshold: int) -> str:
    if quantity == 0:
        return EquipmentStatus.OUT_OF_STOCK
    elif quantity <= min_threshold:
        return EquipmentStatus.LOW_STOCK
    return EquipmentStatus.AVAILABLE
