"""Services métier pour la gestion des paniers d'achat."""

from django.db import transaction
from rest_framework.exceptions import ValidationError

from apps.orders.models.cart import Cart, CartItem
from apps.inventory_variants.models.variant import ProductVariant
from apps.custom_prints.services.custom_print_service import create_print_detail


def add_item_to_cart(
    *,
    cart: Cart,
    variant_id: int,
    quantity: int = 1,
    custom_print_data: dict = None
) -> CartItem:
    """Ajoute une variante d'article dans le panier avec flocage optionnel."""
    try:
        variant = ProductVariant.objects.select_related('product').get(pk=variant_id)
    except ProductVariant.DoesNotExist:
        raise ValidationError("Variante de produit introuvable.")

    if not variant.is_in_stock:
        raise ValidationError(f"La variante {variant.sku} est en rupture de stock.")

    print_detail = None
    if custom_print_data and variant.product.is_customizable:
        print_detail = create_print_detail(**custom_print_data)

    # Vérifier si l'article est déjà présent sans flocage (ou créer une nouvelle ligne si flocage unique)
    if not print_detail:
        item, created = CartItem.objects.get_or_create(
            cart=cart,
            variant=variant,
            print_detail=None,
            defaults={'quantity': quantity}
        )
        if not created:
            item.quantity += quantity
            item.save(update_fields=['quantity'])
    else:
        item = CartItem.objects.create(
            cart=cart,
            variant=variant,
            quantity=quantity,
            print_detail=print_detail
        )

    return item


def update_cart_item(*, cart_item_id: int, quantity: int) -> CartItem:
    """Met à jour la quantité d'un article du panier (0 pour supprimer)."""
    try:
        item = CartItem.objects.get(pk=cart_item_id)
    except CartItem.DoesNotExist:
        raise ValidationError("Article du panier introuvable.")

    if quantity <= 0:
        item.delete()
        return None

    item.quantity = quantity
    item.save(update_fields=['quantity'])
    return item


def remove_item_from_cart(*, cart_item_id: int) -> None:
    """Retire un article du panier."""
    CartItem.objects.filter(pk=cart_item_id).delete()


def clear_cart(*, cart: Cart) -> None:
    """Vide intégralement le panier."""
    cart.items.all().delete()
