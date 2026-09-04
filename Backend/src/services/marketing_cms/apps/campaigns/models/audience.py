"""Modèle pour les segments d'audience des campagnes marketing."""

from django.db import models


class AudienceSegment(models.Model):
    """Segment d'audience ciblé pour l'envoi de campagnes (ex: Parents U15, Abonnés VIP)."""
    club_id = models.BigIntegerField(db_index=True, help_text="ID du club propriétaire du segment")
    name = models.CharField(max_length=255, help_text="Nom du segment d'audience")
    description = models.TextField(blank=True, default="", help_text="Description des critères de l'audience")
    filters = models.JSONField(default=dict, blank=True, help_text="Filtres dynamiques (âge, équipe, rôle, etc.)")
    estimated_size = models.PositiveIntegerField(default=0, help_text="Taille estimée de l'audience")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'cms_audience_segment'
        ordering = ['-created_at']
        verbose_name = "Segment d'audience"
        verbose_name_plural = "Segments d'audience"

    def __str__(self):
        return f"{self.name} (Club {self.club_id} - ~{self.estimated_size} destinataires)"
