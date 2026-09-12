"""Modèle Product — Fiche d'un produit en vente dans la boutique."""

from django.db import models
from django.utils.text import slugify
from apps.catalog.models.category import Category


class Product(models.Model):
    """Produit de la boutique officielle du club."""

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Brouillon'
        PUBLISHED = 'PUBLISHED', 'Publié'
        OUT_OF_STOCK = 'OUT_OF_STOCK', 'Rupture de stock'
        ARCHIVED = 'ARCHIVED', 'Archivé'

    club_id = models.BigIntegerField(db_index=True, help_text="ID du club propriétaire")
    name = models.CharField(max_length=255, help_text="Nom du produit")
    slug = models.SlugField(max_length=280, help_text="Slug URL unique pour le club")
    description = models.TextField(blank=True, default="")
    
    base_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Prix de base")
    currency = models.CharField(max_length=10, default='EUR', help_text="Devise (EUR, XAF, USD)")
    
    main_image_url = models.URLField(max_length=1000, blank=True, null=True, help_text="Image principale")
    images_gallery = models.JSONField(default=list, blank=True, help_text="Liste d'URLs d'images secondaires")
    
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products',
        help_text="Catégorie associée"
    )
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    is_customizable = models.BooleanField(default=False, help_text="Autorise le flocage (Nom, Numéro)")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'shop_products'
        ordering = ['-created_at']
        unique_together = [['club_id', 'slug']]
        verbose_name = "Produit"
        verbose_name_plural = "Produits"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.name} ({self.base_price} {self.currency}) - {self.status}"
