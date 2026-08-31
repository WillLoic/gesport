"""
Modèle Season — Saison sportive d'un club.

Une saison délimite une période d'activité du club (ex: "2025-2026").
Toutes les données sportives (convocations, matchs, cotisations) sont
rattachées à une saison, ce qui permet de séparer les archives proprement.

Règle : un club ne peut avoir qu'UNE seule saison marquée is_current=True.
"""

from django.db import models
# pyrefly: ignore [missing-import]
from apps.club.models.club import Club


class Season(models.Model):
    """Saison sportive d'un club (ex: 2025-2026)."""

    club = models.ForeignKey(
        Club,
        on_delete=models.CASCADE,
        related_name='seasons',
        verbose_name="Club"
    )
    name = models.CharField(
        max_length=20,
        verbose_name="Nom de la saison",
        help_text="Ex: '2025-2026'"
    )
    start_date = models.DateField(verbose_name="Date de début")
    end_date = models.DateField(verbose_name="Date de fin")
    is_current = models.BooleanField(
        default=False,
        verbose_name="Saison en cours",
        help_text="Une seule saison peut être 'en cours' par club."
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'auth_seasons'
        verbose_name = 'Saison sportive'
        verbose_name_plural = 'Saisons sportives'
        ordering = ['-start_date']
        # Contrainte : 2 saisons d'un même club ne peuvent pas avoir le même nom
        unique_together = [['club', 'name']]

    def __str__(self) -> str:
        current_marker = " ✓" if self.is_current else ""
        return f"{self.club.short_name or self.club.name} — {self.name}{current_marker}"

    def save(self, *args, **kwargs):
        """
        Garantit qu'une seule saison est marquée is_current=True par club.
        Si cette saison est définie comme courante, on désactive les autres.
        """
        if self.is_current:
            Season.objects.filter(club=self.club, is_current=True).exclude(pk=self.pk).update(is_current=False)
        super().save(*args, **kwargs)
