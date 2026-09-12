"""Modèle StockMovement — Mouvements et traçabilité des stocks."""

from django.db import models
from apps.inventory_variants.models.variant import ProductVariant


class StockMovement(models.Model):
    """Journal des mouvements d'inventaire (Entrées, Ventes, Ajustements, Retours)."""

    class MovementType(models.TextChoices):
        ENTRY = 'ENTRY', 'Réapprovisionnement'
        SALE = 'SALE', 'Vente / Commande'
        ADJUSTMENT = 'ADJUSTMENT', 'Ajustement inventaire'
        RETURN = 'RETURN', 'Retour client'

    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name='stock_movements')
    quantity = models.IntegerField(help_text="Variation de quantité (+ pour entrée, - pour sortie)")
    movement_type = models.CharField(max_length=20, choices=MovementType.choices, default=MovementType.ENTRY)
    reason = models.CharField(max_length=255, blank=True, default="", help_text="Raison ou référence de commande")
    author_id = models.BigIntegerField(null=True, blank=True, help_text="ID de l'utilisateur ayant fait l'ajustement")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'shop_stock_movements'
        ordering = ['-created_at']
        verbose_name = "Mouvement de stock"
        verbose_name_plural = "Mouvements de stock"

    def __str__(self) -> str:
        return f"{self.variant.sku} | {self.get_movement_type_display()} : {self.quantity} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"
