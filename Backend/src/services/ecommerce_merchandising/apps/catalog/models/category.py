"""Modèle Category — Catégories d'articles de la boutique du club."""

from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    """Catégorie de produits (ex: Maillots, Survêtements, Goodies)."""

    club_id = models.BigIntegerField(db_index=True, help_text="ID du club propriétaire")
    name = models.CharField(max_length=100, help_text="Nom de la catégorie")
    slug = models.SlugField(max_length=120, help_text="Slug URL unique pour le club")
    description = models.TextField(blank=True, default="")
    image_url = models.URLField(max_length=1000, blank=True, null=True)
    
    parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subcategories',
        help_text="Catégorie parente si sous-catégorie"
    )
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'shop_categories'
        ordering = ['name']
        unique_together = [['club_id', 'slug']]
        verbose_name = "Catégorie produit"
        verbose_name_plural = "Catégories produits"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.name} (Club #{self.club_id})"
