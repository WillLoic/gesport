from django.test import TestCase
from decimal import Decimal
from rest_framework.exceptions import ValidationError
from apps.catalog.services.catalog_service import create_product
from apps.inventory_variants.models import ProductVariant, StockMovement
from apps.inventory_variants.services.inventory_service import (
    create_variant, update_variant, delete_variant, adjust_stock
)


class InventoryVariantsTestCase(TestCase):

    def setUp(self):
        self.product = create_product(
            club_id=1,
            name="Maillot Extérieur 2026",
            base_price=Decimal("80.00"),
        )
        self.variant = create_variant(
            product_id=self.product.id,
            sku="MAI-EXT-2026-M",
            size=ProductVariant.Size.M,
            color="Rouge",
            stock_quantity=20,
        )

    def test_create_variant_initializes_stock_and_movement(self):
        self.assertEqual(self.variant.sku, "MAI-EXT-2026-M")
        self.assertEqual(self.variant.stock_quantity, 20)
        self.assertTrue(self.variant.is_in_stock)
        self.assertEqual(self.variant.price, Decimal("80.00"))

        movement = StockMovement.objects.filter(variant=self.variant).first()
        self.assertIsNotNone(movement)
        self.assertEqual(movement.quantity, 20)
        self.assertEqual(movement.movement_type, StockMovement.MovementType.ENTRY)

    def test_adjust_stock_positive(self):
        updated = adjust_stock(
            variant_id=self.variant.id,
            quantity_change=10,
            movement_type=StockMovement.MovementType.ENTRY,
            reason="Réapprovisionnement fournisseur",
        )
        self.assertEqual(updated.stock_quantity, 30)

    def test_adjust_stock_negative(self):
        updated = adjust_stock(
            variant_id=self.variant.id,
            quantity_change=-5,
            movement_type=StockMovement.MovementType.SALE,
            reason="Vente boutique",
        )
        self.assertEqual(updated.stock_quantity, 15)

    def test_adjust_stock_insufficient_raises_validation_error(self):
        with self.assertRaises(ValidationError):
            adjust_stock(
                variant_id=self.variant.id,
                quantity_change=-50,
                movement_type=StockMovement.MovementType.SALE,
            )

    def test_update_and_delete_variant(self):
        updated = update_variant(variant_id=self.variant.id, price_override=Decimal("85.00"))
        self.assertEqual(updated.price, Decimal("85.00"))

        v_id = self.variant.id
        delete_variant(variant_id=v_id)
        self.assertFalse(ProductVariant.objects.filter(id=v_id).exists())

