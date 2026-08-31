from django.test import TestCase
from decimal import Decimal
from apps.procurement.models import PurchaseOrderStatus
from apps.procurement.services.procurement_service import (
    create_supplier, create_purchase_order, update_po_status
)


class ProcurementTestCase(TestCase):

    def setUp(self):
        self.supplier = create_supplier(
            name="EquipSport SARL",
            email="contact@equipsport.fr",
            contact_person="Marc Dupont",
            category="Équipementier",
        )

    def test_create_supplier(self):
        self.assertEqual(self.supplier.name, "EquipSport SARL")
        self.assertEqual(self.supplier.category, "Équipementier")

    def test_create_purchase_order_calculates_total(self):
        items_data = [
            {"description": "Maillots Match Domicile", "quantity": 20, "unit_price": "25.00"},
            {"description": "Chasubles d'entraînement", "quantity": 50, "unit_price": "5.00"},
        ]
        po = create_purchase_order(
            supplier=self.supplier,
            items_data=items_data,
            notes="Commande saison 2026",
        )

        self.assertTrue(po.po_number.startswith("BC-2026-"))
        self.assertEqual(po.status, PurchaseOrderStatus.DRAFT)
        self.assertEqual(po.items.count(), 2)
        # 20 * 25.00 = 500.00, 50 * 5.00 = 250.00 => Total = 750.00
        self.assertEqual(po.total_amount, Decimal('750.00'))

    def test_update_po_status(self):
        po = create_purchase_order(
            supplier=self.supplier,
            items_data=[{"description": "Balles de tennis x3", "quantity": 10, "unit_price": "12.00"}],
        )
        self.assertEqual(po.status, PurchaseOrderStatus.DRAFT)

        updated = update_po_status(po=po, new_status=PurchaseOrderStatus.APPROVED)
        self.assertEqual(updated.status, PurchaseOrderStatus.APPROVED)

