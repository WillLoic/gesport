from django.test import TestCase
from decimal import Decimal
from rest_framework.exceptions import ValidationError
from apps.catalog.services.catalog_service import create_product
from apps.inventory_variants.services.inventory_service import create_variant
from apps.orders.models import Cart, Order
from apps.orders.services.cart_service import add_item_to_cart, update_cart_item, remove_item_from_cart, clear_cart
from apps.orders.services.order_service import create_order_from_cart, update_order_status


class OrdersTestCase(TestCase):

    def setUp(self):
        self.product = create_product(
            club_id=1,
            name="Chaussettes Match",
            base_price=Decimal("10.00"),
        )
        self.variant = create_variant(
            product_id=self.product.id,
            sku="CHAUSS-2026-L",
            stock_quantity=15,
        )
        self.cart = Cart.objects.create(
            session_id="session-test-123",
            club_id=1,
        )

    def test_add_item_to_cart_calculates_subtotal(self):
        item = add_item_to_cart(cart=self.cart, variant_id=self.variant.id, quantity=2)
        self.assertEqual(item.quantity, 2)
        self.assertEqual(item.subtotal, Decimal("20.00"))
        self.assertEqual(self.cart.total_price, Decimal("20.00"))

    def test_update_and_remove_cart_item(self):
        item = add_item_to_cart(cart=self.cart, variant_id=self.variant.id, quantity=3)
        updated = update_cart_item(cart_item_id=item.id, quantity=5)
        self.assertEqual(updated.quantity, 5)

        remove_item_from_cart(cart_item_id=item.id)
        self.assertEqual(self.cart.items.count(), 0)

    def test_create_order_from_cart(self):
        add_item_to_cart(cart=self.cart, variant_id=self.variant.id, quantity=2)

        order = create_order_from_cart(
            cart=self.cart,
            customer_name="Jean Dupont",
            customer_email="jean@example.com",
            shipping_address="10 Rue de la Paix, Paris",
            shipping_cost=Decimal("5.00"),
        )

        self.assertEqual(order.customer_name, "Jean Dupont")
        self.assertEqual(order.subtotal, Decimal("20.00"))
        self.assertEqual(order.total_price, Decimal("25.00"))
        self.assertEqual(order.status, Order.Status.PENDING)
        self.assertEqual(self.cart.items.count(), 0)  # Panier vidé

    def test_order_status_paid_decrements_stock(self):
        add_item_to_cart(cart=self.cart, variant_id=self.variant.id, quantity=3)
        order = create_order_from_cart(
            cart=self.cart,
            customer_name="Alice Martin",
            customer_email="alice@example.com",
            shipping_address="Adresse Test",
        )

        update_order_status(order_id=order.id, new_status=Order.Status.PAID)
        self.variant.refresh_from_db()
        self.assertEqual(self.variant.stock_quantity, 12)  # 15 - 3

    def test_order_cancelled_restores_stock(self):
        add_item_to_cart(cart=self.cart, variant_id=self.variant.id, quantity=4)
        order = create_order_from_cart(
            cart=self.cart,
            customer_name="Bob Smith",
            customer_email="bob@example.com",
            shipping_address="Adresse Test",
        )

        update_order_status(order_id=order.id, new_status=Order.Status.PAID)
        self.variant.refresh_from_db()
        self.assertEqual(self.variant.stock_quantity, 11)  # 15 - 4

        update_order_status(order_id=order.id, new_status=Order.Status.CANCELLED)
        self.variant.refresh_from_db()
        self.assertEqual(self.variant.stock_quantity, 15)  # Restitué 11 + 4

