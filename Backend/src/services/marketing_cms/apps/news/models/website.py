"""
Modèle ClubWebsiteConfig — Configuration du site web vitrine du club.
"""

from django.db import models


class ClubWebsiteConfig(models.Model):
    """Configuration du site web vitrine du club avec son sous-domaine."""

    club_id = models.IntegerField(verbose_name="ID du Club", db_index=True, unique=True)
    club_name = models.CharField(max_length=150, verbose_name="Nom du club")
    subdomain = models.SlugField(
        max_length=80, unique=True,
        verbose_name="Sous-domaine",
        help_text="Sera utilisé comme https://[subdomain].gesport.com"
    )

    # Branding
    logo_url = models.URLField(blank=True, default='', verbose_name="URL du logo")
    banner_url = models.URLField(blank=True, default='', verbose_name="URL de la bannière")
    primary_color = models.CharField(max_length=7, default='#1E3A5F', verbose_name="Couleur primaire (hex)")
    secondary_color = models.CharField(max_length=7, default='#F5A623', verbose_name="Couleur secondaire (hex)")

    # SEO & Metas
    meta_title = models.CharField(max_length=200, blank=True, default='', verbose_name="Meta title (SEO)")
    meta_description = models.TextField(blank=True, default='', verbose_name="Meta description (SEO)")

    # Réseaux sociaux
    facebook_url = models.URLField(blank=True, default='', verbose_name="Facebook")
    instagram_url = models.URLField(blank=True, default='', verbose_name="Instagram")
    twitter_url = models.URLField(blank=True, default='', verbose_name="X / Twitter")
    youtube_url = models.URLField(blank=True, default='', verbose_name="YouTube")

    is_published = models.BooleanField(default=False, verbose_name="Site publié")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'cms_club_website_config'
        verbose_name = 'Configuration Site Web'
        verbose_name_plural = 'Configurations Sites Web'

    def __str__(self) -> str:
        return f"{self.club_name} — {self.subdomain}.gesport.com"
