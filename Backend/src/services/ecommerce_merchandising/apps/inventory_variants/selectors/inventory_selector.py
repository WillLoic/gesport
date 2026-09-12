"""Selectors (requêtes ORM) pour l'inventaire et les variantes."""

from django.db.models import F
from apps.inventory_variants.models.variant import ProductVariant
from apps.inventory_variants.models.stock_movement import StockMovement


def list_variants_by_product(product_id: int):
    """Liste les variantes actives d'un produit."""
    return ProductVariant.objects.filter(product_id=product_id, is_active=True)


def get_variant_by_id(variant_id: int) -> ProductVariant:
    """Récupère une variante par ID."""
    return ProductVariant.objects.select_related('product').get(pk=variant_id)


def get_variant_by_sku(sku: str) -> ProductVariant:
    """Récupère une variante par son code SKU."""
    return ProductVariant.objects.select_related('product').get(sku=sku)


def list_low_stock_variants(club_id: int):
    """Liste les variantes en alerte de stock bas pour un club."""
    return ProductVariant.objects.filter(
        product__club_id=club_id,
        is_active=True,
        stock_quantity__lte=F('reorder_threshold')
    ).select_related('product')


def list_stock_movements_by_variant(variant_id: int):
    """Liste l'historique des mouvements de stock d'une variante."""
    return StockMovement.objects.filter(variant_id=variant_id)
