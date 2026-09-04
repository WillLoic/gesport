"""
Modèles ArticleCategory, ArticleTag et Article — Actualités et articles de presse du club.
"""

from django.db import models
from django.utils.text import slugify


class ArticleCategory(models.Model):
    """Catégorie d'article (ex: Résultats, Transferts, Vie du club)."""

    club_id = models.IntegerField(verbose_name="ID du Club", db_index=True)
    name = models.CharField(max_length=100, verbose_name="Nom de la catégorie")
    slug = models.SlugField(max_length=120, verbose_name="Slug URL")

    class Meta:
        db_table = 'cms_article_categories'
        verbose_name = 'Catégorie d\'article'
        verbose_name_plural = 'Catégories d\'articles'
        unique_together = [['club_id', 'slug']]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name


class ArticleTag(models.Model):
    """Tag/mot-clé pour les articles."""

    club_id = models.IntegerField(verbose_name="ID du Club", db_index=True)
    name = models.CharField(max_length=60, verbose_name="Tag")

    class Meta:
        db_table = 'cms_article_tags'
        verbose_name = 'Tag'
        verbose_name_plural = 'Tags'
        unique_together = [['club_id', 'name']]

    def __str__(self) -> str:
        return self.name


class Article(models.Model):
    """Article de presse / actualité publié sur le site vitrine du club."""

    STATUS_CHOICES = [
        ('DRAFT', 'Brouillon'),
        ('PUBLISHED', 'Publié'),
        ('ARCHIVED', 'Archivé'),
    ]

    club_id = models.IntegerField(verbose_name="ID du Club", db_index=True)
    title = models.CharField(max_length=250, verbose_name="Titre de l'article")
    slug = models.SlugField(max_length=280, verbose_name="Slug URL")
    summary = models.TextField(blank=True, default='', verbose_name="Résumé / Chapeau")
    content = models.TextField(verbose_name="Contenu (HTML / RichText)")
    cover_image_url = models.URLField(blank=True, default='', verbose_name="Image de couverture (URL)")

    category = models.ForeignKey(
        ArticleCategory, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='articles', verbose_name="Catégorie"
    )
    tags = models.ManyToManyField(ArticleTag, blank=True, related_name='articles', verbose_name="Tags")

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    published_at = models.DateTimeField(null=True, blank=True, verbose_name="Date de publication")
    views_count = models.PositiveIntegerField(default=0, verbose_name="Nombre de vues")
    author_id = models.IntegerField(null=True, blank=True, verbose_name="ID Auteur (IAM)")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'cms_articles'
        verbose_name = 'Article'
        verbose_name_plural = 'Articles'
        ordering = ['-published_at', '-created_at']
        unique_together = [['club_id', 'slug']]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.title} ({self.get_status_display()})"
