"""Modèle ProductVariant — Variantes de produit (Taille, Couleur, SKU, Stock)."""

from django.db import models
from apps.catalog.models.product import Product


class ProductVariant(models.Model):
    """Déclinaison spécifique d'un produit (ex: Maillot Domicile Taille M Couleur Bleue)."""

    class Size(models.TextChoices):
        XS = 'XS', 'XS'
        S = 'S', 'S'
        M = 'M', 'M'
        L = 'L', 'L'
        XL = 'XL', 'XL'
        XXL = 'XXL', 'XXL'
        UNIQUE = 'UNIQUE', 'Taille Unique'

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    size = models.CharField(max_length=20, choices=Size.choices, default=Size.M)
    color = models.CharField(max_length=50, blank=True, default="", help_text="Couleur (ex: Bleu, Rouge)")
    sku = models.CharField(max_length=100, unique=True, db_index=True, help_text="Code SKU unique d'inventaire")
    
    price_override = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Prix de vente si différent du prix de base du produit"
    )
    stock_quantity = models.PositiveIntegerField(default=0, help_text="Quantité actuellement disponible")
    reorder_threshold = models.PositiveIntegerField(default=5, help_text="Seuil d'alerte de stock bas")
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'shop_product_variants'
        ordering = ['size', 'color']
        verbose_name = "Variante de produit"
        verbose_name_plural = "Variantes de produits"

    @property
    def price(self):
        """Retourne le prix effectif de la variante (prix spécifique ou prix de base)."""
        if self.price_override is not None:
            return self.price_override
        return self.product.base_price

    @property
    def is_in_stock(self) -> bool:
        return self.stock_quantity > 0

    def __str__(self) -> str:
        return f"{self.product.name} - [{self.size}/{self.color}] (SKU: {self.sku}) Stock: {self.stock_quantity}"
