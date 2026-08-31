"""
Modèle Club — Entité racine du multi-tenancy GESPORT.

Un Club est la structure sportive principale.
Chaque donnée (membres, matchs, finances...) est rattachée à un Club.
C'est le pivot du système multi-tenancy : plusieurs clubs peuvent coexister
sur la même plateforme, totalement isolés l'un de l'autre.
"""

from django.db import models
from django.utils.text import slugify


class Club(models.Model):
    """
    Représente un club omnisports (ex: "US Montrouge Football", "BC Paris").

    Le 'slug' est généré automatiquement depuis le nom et sert d'identifiant
    dans les URLs (ex: /clubs/us-montrouge-football/).
    """

    # Informations de base
    name = models.CharField(
        max_length=200,
        verbose_name="Nom du club",
        help_text="Nom officiel du club (ex: 'AS Saint-Germain Omnisports')"
    )
    slug = models.SlugField(
        max_length=220,
        unique=True,
        blank=True,
        verbose_name="Slug URL",
        help_text="Identifiant unique dans les URLs. Généré automatiquement depuis le nom."
    )
    short_name = models.CharField(
        max_length=50,
        blank=True,
        default='',
        verbose_name="Nom abrégé",
        help_text="Ex: 'ASSG' ou 'USM'"
    )

    # Identité visuelle
    logo = models.ImageField(
        upload_to='clubs/logos/',
        null=True,
        blank=True,
        verbose_name="Logo"
    )
    primary_color = models.CharField(
        max_length=7,
        default='#1a56db',
        verbose_name="Couleur principale (hex)",
        help_text="Ex: #1a56db"
    )
    secondary_color = models.CharField(
        max_length=7,
        default='#ffffff',
        verbose_name="Couleur secondaire (hex)"
    )

    # Coordonnées
    address = models.CharField(max_length=300, blank=True, default='', verbose_name="Adresse")
    city = models.CharField(max_length=100, blank=True, default='', verbose_name="Ville")
    postal_code = models.CharField(max_length=20, blank=True, default='', verbose_name="Code postal")
    phone = models.CharField(max_length=20, blank=True, default='', verbose_name="Téléphone")
    email = models.EmailField(blank=True, default='', verbose_name="Email du club")
    website = models.URLField(blank=True, default='', verbose_name="Site web")

    # Description
    description = models.TextField(blank=True, default='', verbose_name="Description")

    # Statut
    is_active = models.BooleanField(default=True, verbose_name="Club actif")

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'auth_clubs'
        verbose_name = 'Club'
        verbose_name_plural = 'Clubs'
        ordering = ['name']

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        """Génère le slug automatiquement si non renseigné."""
        if not self.slug:
            self.slug = slugify(self.name)
            # Garantit l'unicité du slug si deux clubs ont le même nom
            original_slug = self.slug
            counter = 1
            while Club.objects.filter(slug=self.slug).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
        super().save(*args, **kwargs)
