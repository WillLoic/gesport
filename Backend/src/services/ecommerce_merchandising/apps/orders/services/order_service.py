"""Services métier pour la création, validation du checkout et mise à jour des commandes."""

import logging
from decimal import Decimal
from django.db import transaction
from rest_framework.exceptions import ValidationError

from apps.orders.models.cart import Cart
from apps.orders.models.order import Order, OrderItem
from apps.inventory_variants.models.stock_movement import StockMovement
from apps.inventory_variants.services.inventory_service import adjust_stock

logger = logging.getLogger(__name__)


def create_order_from_cart(
    *,
    cart: Cart,
    customer_name: str,
    customer_email: str,
    customer_phone: str = "",
    shipping_address: str,
    shipping_cost: Decimal = Decimal('0.00')
) -> Order:
    """Crée une commande à partir du panier courant après vérification de disponibilité du stock."""
    cart_items = cart.items.select_related('variant__product', 'print_detail').all()

    if not cart_items.exists():
        raise ValidationError("Votre panier est vide. Impossible de passer la commande.")

    # 1. Vérification de disponibilité du stock pour chaque article au checkout
    for item in cart_items:
        variant = item.variant
        if variant.stock_quantity < item.quantity:
            raise ValidationError(
                f"Stock insuffisant pour l'article '{variant.product.name} ({variant.size})'. "
                f"Disponible: {variant.stock_quantity}, Requis: {item.quantity}."
            )

    # 2. Calcul du sous-total
    subtotal = sum(item.subtotal for item in cart_items)
    total_price = Decimal(str(subtotal)) + Decimal(str(shipping_cost))

    with transaction.atomic():
        order = Order.objects.create(
            club_id=cart.club_id,
            user_id=cart.user_id,
            customer_name=customer_name,
            customer_email=customer_email,
            customer_phone=customer_phone,
            shipping_address=shipping_address,
            status=Order.Status.PENDING,
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            total_price=total_price,
            currency=cart_items[0].variant.product.currency or 'EUR'
        )

        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                variant=item.variant,
                product_name=item.variant.product.name,
                variant_sku=item.variant.sku,
                unit_price=item.unit_price,
                quantity=item.quantity,
                total_price=item.subtotal,
                print_detail=item.print_detail
            )

        # Vider le panier
        cart.items.all().delete()

        logger.info(f"Commande #{order.order_number} créée pour {customer_name} (Total: {total_price} {order.currency}).")
        return order


def update_order_status(*, order_id: int, new_status: str) -> Order:
    """Met à jour le statut d'une commande et gère la réservation de stock lors de la validation du paiement."""
    with transaction.atomic():
        try:
            order = Order.objects.select_for_update().get(pk=order_id)
        except Order.DoesNotExist:
            raise ValidationError("Commande introuvable.")

        old_status = order.status

        if old_status == new_status:
            return order

        # Réservation effective du stock lorsque la commande passe à PAID
        if new_status == Order.Status.PAID and old_status != Order.Status.PAID:
            for item in order.items.select_related('variant').all():
                if item.variant:
                    adjust_stock(
                        variant_id=item.variant.id,
                        quantity_change=-item.quantity,
                        movement_type=StockMovement.MovementType.SALE,
                        reason=f"Commande #{order.order_number}"
                    )

        # Restitution du stock si une commande payée est ANNULÉE
        elif new_status == Order.Status.CANCELLED and old_status == Order.Status.PAID:
            for item in order.items.select_related('variant').all():
                if item.variant:
                    adjust_stock(
                        variant_id=item.variant.id,
                        quantity_change=item.quantity,
                        movement_type=StockMovement.MovementType.RETURN,
                        reason=f"Annulation commande #{order.order_number}"
                    )

        order.status = new_status
        order.save(update_fields=['status'])

        logger.info(f"Commande #{order.order_number} statut modifié: {old_status} -> {new_status}.")
        return order
