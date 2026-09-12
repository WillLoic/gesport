"""Services métier pour la gestion des variantes et des mouvements de stock."""

from django.db import transaction
from django.db.models import F
from rest_framework.exceptions import ValidationError

from apps.inventory_variants.models.variant import ProductVariant
from apps.inventory_variants.models.stock_movement import StockMovement


def create_variant(*, product_id: int, sku: str, **kwargs) -> ProductVariant:
    """Création d'une variante de produit."""
    initial_stock = kwargs.pop('stock_quantity', 0)
    variant = ProductVariant.objects.create(
        product_id=product_id,
        sku=sku,
        stock_quantity=0,
        **kwargs
    )

    if initial_stock > 0:
        return adjust_stock(
            variant_id=variant.id,
            quantity_change=initial_stock,
            movement_type=StockMovement.MovementType.ENTRY,
            reason="Stock initial"
        )
    return variant


def update_variant(*, variant_id: int, **kwargs) -> ProductVariant:
    """Mise à jour des caractéristiques d'une variante (hors ajustement manuel direct du stock)."""
    kwargs.pop('stock_quantity', None)
    ProductVariant.objects.filter(pk=variant_id).update(**kwargs)
    return ProductVariant.objects.get(pk=variant_id)


def delete_variant(*, variant_id: int) -> None:
    """Desactive/Supprime une variante."""
    ProductVariant.objects.filter(pk=variant_id).delete()


def adjust_stock(
    *,
    variant_id: int,
    quantity_change: int,
    movement_type: str = StockMovement.MovementType.ADJUSTMENT,
    reason: str = "",
    author_id: int = None
) -> ProductVariant:
    """Ajustement atomique du stock d'une variante avec enregistrement du mouvement."""
    with transaction.atomic():
        try:
            variant = ProductVariant.objects.select_for_update().get(pk=variant_id)
        except ProductVariant.DoesNotExist:
            raise ValidationError("Variante de produit introuvable.")

        new_stock = variant.stock_quantity + quantity_change
        if new_stock < 0:
            raise ValidationError(
                f"Stock insuffisant pour la variante {variant.sku}. "
                f"Disponible: {variant.stock_quantity}, Demandé: {abs(quantity_change)}."
            )

        variant.stock_quantity = new_stock
        variant.save(update_fields=['stock_quantity'])

        StockMovement.objects.create(
            variant=variant,
            quantity=quantity_change,
            movement_type=movement_type,
            reason=reason,
            author_id=author_id
        )

        return variant
