"""
Modèle TalentProspect — Cellule de recrutement, scouting et radar de compétences multi-sports.
"""

from django.db import models


DEFAULT_RADAR_PRESETS = {
    'football': {'vitesse': 8, 'technique': 7, 'physique': 8, 'vision': 7, 'mental': 8},
    'basketball': {'detente': 8, 'adresse': 7, 'physique': 8, 'vision': 7, 'defense': 8},
    'volleyball': {'detente': 8, 'attaque': 7, 'service': 8, 'block': 7, 'defense': 8},
    'handball': {'puissance': 8, 'tir': 7, 'agilite': 8, 'defense': 7, 'vision': 8},
    'rugby': {'puissance': 8, 'plaquage': 8, 'vitesse': 7, 'endurance': 8, 'mental': 9},
    'tennis': {'service': 8, 'coup_d_droit': 7, 'revers': 8, 'deplacement': 8, 'mental': 8},
}


class TalentProspect(models.Model):
    """Fiche de prospect supervisé par la cellule de recrutement du club."""

    STATUS_CHOICES = [
        ('Supervisé', 'Supervisé'),
        ('Contacté', 'Contacté'),
        ('Essai Programmé', 'Essai Programmé'),
        ('Recruté', 'Recruté'),
        ('Classé', 'Classé'),
    ]

    club_id = models.IntegerField(verbose_name="ID du Club", db_index=True)
    first_name = models.CharField(max_length=100, verbose_name="Prénom")
    last_name = models.CharField(max_length=100, verbose_name="Nom")
    birth_year = models.IntegerField(verbose_name="Année de naissance")
    sport_type = models.CharField(max_length=30, default='football', verbose_name="Sport")
    position = models.CharField(max_length=50, verbose_name="Poste principal")
    current_club = models.CharField(max_length=150, blank=True, default='', verbose_name="Club actuel")

    overall_rating = models.FloatField(default=7.5, verbose_name="Note globale (/10)")
    radar_scores_json = models.JSONField(default=dict, verbose_name="Radar de compétences par critère")
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Supervisé')
    scout_notes = models.TextField(blank=True, default='', verbose_name="Rapport du recruteur")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sport_recruitment_prospects'
        verbose_name = 'Prospect Scouting'
        verbose_name_plural = 'Prospects Scouting'
        ordering = ['-overall_rating', 'last_name']

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name} ({self.position}) - {self.overall_rating}/10"

    def save(self, *args, **kwargs):
        """Initialise le radar par défaut selon le sport si non renseigné."""
        if not self.radar_scores_json:
            self.radar_scores_json = DEFAULT_RADAR_PRESETS.get(self.sport_type, DEFAULT_RADAR_PRESETS['football'])
        super().save(*args, **kwargs)
