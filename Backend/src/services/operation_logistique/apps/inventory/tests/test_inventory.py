from django.test import TestCase
from apps.inventory.models import EquipmentCategory, EquipmentStatus, StorageLocation
from apps.inventory.services.inventory_service import create_equipment_item, update_stock_quantity
from apps.inventory.selectors.inventory_selector import get_low_stock_alerts


class InventoryTestCase(TestCase):
    def setUp(self):
        self.loc = StorageLocation.objects.create(name="Magasin Principal", building="Bâtiment A")

    def test_create_equipment_and_status(self):
        item = create_equipment_item(
            name="Ballons de Football Taille 5",
            category=EquipmentCategory.BALLS,
            quantity_in_stock=20,
            min_stock_threshold=5,
            location=self.loc
        )
        self.assertEqual(item.status, EquipmentStatus.AVAILABLE)
        self.assertEqual(item.location.name, "Magasin Principal")

    def test_stock_alerts_triggering(self):
        item = create_equipment_item(
            name="Chasubles Rouges",
            category=EquipmentCategory.UNIFORMS,
            quantity_in_stock=15,
            min_stock_threshold=10
        )
        self.assertEqual(get_low_stock_alerts().count(), 0)

        # Update stock below threshold
        update_stock_quantity(item, 8)
        self.assertEqual(item.status, EquipmentStatus.LOW_STOCK)
        self.assertEqual(get_low_stock_alerts().count(), 1)

        # Update stock to 0
        update_stock_quantity(item, 0)
        self.assertEqual(item.status, EquipmentStatus.OUT_OF_STOCK)
