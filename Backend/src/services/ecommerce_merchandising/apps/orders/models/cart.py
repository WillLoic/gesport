"""Modèle Cart et CartItem — Panier d'achat temporaire."""

from django.db import models
from apps.inventory_variants.models.variant import ProductVariant
from apps.custom_prints.models.print_detail import CustomPrintDetail


class Cart(models.Model):
    """Panier d'achat d'un utilisateur ou d'une session."""

    session_id = models.CharField(max_length=100, db_index=True, help_text="ID de session anonyme ou jeton panier")
    user_id = models.BigIntegerField(null=True, blank=True, help_text="ID de l'utilisateur authentifié (IAM)")
    club_id = models.BigIntegerField(db_index=True, help_text="ID du club de la boutique")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'shop_carts'
        verbose_name = "Panier"
        verbose_name_plural = "Paniers"

    @property
    def total_price(self):
        return sum(item.subtotal for item in self.items.all())

    def __str__(self) -> str:
        return f"Panier #{self.id} (Session {self.session_id[:8]})"


class CartItem(models.Model):
    """Article individuel présent dans un panier."""

    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name='cart_items')
    quantity = models.PositiveIntegerField(default=1)
    
    print_detail = models.ForeignKey(
        CustomPrintDetail,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cart_items',
        help_text="Flocage personnalisé optionnel"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'shop_cart_items'
        verbose_name = "Article du panier"
        verbose_name_plural = "Articles du panier"

    @property
    def unit_price(self):
        base = self.variant.price
        if self.print_detail and self.print_detail.extra_price:
            return base + self.print_detail.extra_price
        return base

    @property
    def subtotal(self):
        return self.unit_price * self.quantity

    def __str__(self) -> str:
        return f"{self.quantity}x {self.variant.product.name} ({self.variant.size}) dans Panier #{self.cart_id}"
