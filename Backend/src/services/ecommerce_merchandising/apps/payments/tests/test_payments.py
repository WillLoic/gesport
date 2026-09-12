from django.test import TestCase
from decimal import Decimal
from apps.catalog.services.catalog_service import create_product
from apps.inventory_variants.services.inventory_service import create_variant
from apps.orders.models import Cart, Order
from apps.orders.services.cart_service import add_item_to_cart
from apps.orders.services.order_service import create_order_from_cart
from apps.payments.models import PaymentTransaction
from apps.payments.services.stripe_service import create_stripe_checkout_session, handle_stripe_webhook_event


class PaymentsTestCase(TestCase):

    def setUp(self):
        self.product = create_product(
            club_id=1,
            name="Casquette Supporter",
            base_price=Decimal("25.00"),
        )
        self.variant = create_variant(
            product_id=self.product.id,
            sku="CASQ-2026-UNI",
            stock_quantity=10,
        )
        self.cart = Cart.objects.create(session_id="session-payment-test", club_id=1)
        add_item_to_cart(cart=self.cart, variant_id=self.variant.id, quantity=1)

        self.order = create_order_from_cart(
            cart=self.cart,
            customer_name="Paul Durand",
            customer_email="paul@example.com",
            shipping_address="5 Avenue Montaigne, Paris",
        )

    def test_create_stripe_checkout_session(self):
        result = create_stripe_checkout_session(order=self.order)
        self.assertIn("session_id", result)
        self.assertIn("transaction_id", result)

        tx = PaymentTransaction.objects.filter(order=self.order).first()
        self.assertIsNotNone(tx)
        self.assertEqual(tx.amount, Decimal("25.00"))
        self.assertEqual(tx.status, PaymentTransaction.Status.PENDING)
        self.assertEqual(tx.provider, PaymentTransaction.Provider.STRIPE)

    def test_handle_stripe_webhook_event_success(self):
        result = create_stripe_checkout_session(order=self.order)
        tx_id = result["transaction_id"]

        webhook_payload = {
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "id": tx_id,
                    "status": "complete"
                }
            }
        }

        res = handle_stripe_webhook_event(webhook_payload)
        self.assertEqual(res["status"], "SUCCESS")

        tx = PaymentTransaction.objects.get(transaction_id=tx_id)
        self.assertEqual(tx.status, PaymentTransaction.Status.SUCCESS)

        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.Status.PAID)

        self.variant.refresh_from_db()
        self.assertEqual(self.variant.stock_quantity, 9)  # 10 - 1

