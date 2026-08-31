"""
Modèles TacticalBoard, TrainingExercise et TrainingSession — Schémas tactiques et entraînements.
"""

from django.db import models
from apps.teams.models.team import Team


class TacticalBoard(models.Model):
    """Schéma tactique interactif multi-sports (terrain, positions, consignes)."""

    club_id = models.IntegerField(verbose_name="ID du Club", db_index=True)
    title = models.CharField(max_length=150, verbose_name="Titre du schéma")
    sport_type = models.CharField(max_length=30, default='football', verbose_name="Sport")
    system_name = models.CharField(max_length=50, default='4-3-3', verbose_name="Nom du système (ex: 4-3-3, 5-1)")
    lineup_json = models.JSONField(default=dict, verbose_name="Positions des joueurs (JSON)")
    notes = models.TextField(blank=True, default='', verbose_name="Consignes tactiques")
    coach_id = models.IntegerField(null=True, blank=True, verbose_name="ID Coach IAM")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sport_tactical_boards'
        verbose_name = 'Schéma Tactique'
        verbose_name_plural = 'Schémas Tactiques'

    def __str__(self) -> str:
        return f"{self.title} ({self.system_name})"


class TrainingExercise(models.Model):
    """Exercice d'entraînement réutilisable."""

    club_id = models.IntegerField(verbose_name="ID du Club", db_index=True)
    title = models.CharField(max_length=150, verbose_name="Titre de l'exercice")
    sport_type = models.CharField(max_length=30, default='football', verbose_name="Sport")
    category = models.CharField(max_length=50, default='Physique / Cardio', verbose_name="Catégorie")
    duration_minutes = models.IntegerField(default=15, verbose_name="Durée (minutes)")
    description = models.TextField(blank=True, default='', verbose_name="Description & Consignes")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sport_training_exercises'
        verbose_name = 'Exercice d\'entraînement'
        verbose_name_plural = 'Exercices d\'entraînement'

    def __str__(self) -> str:
        return f"{self.title} ({self.duration_minutes} min)"


class TrainingSession(models.Model):
    """Séance d'entraînement programmée pour une équipe."""

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='training_sessions', verbose_name="Équipe")
    title = models.CharField(max_length=150, verbose_name="Titre de la séance")
    session_date = models.DateTimeField(verbose_name="Date et heure de la séance")
    duration_minutes = models.IntegerField(default=90, verbose_name="Durée totale (minutes)")
    exercises = models.ManyToManyField(TrainingExercise, blank=True, related_name='sessions', verbose_name="Exercices du programme")
    attendance_count = models.IntegerField(default=0, verbose_name="Nombre de présents")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sport_training_sessions'
        verbose_name = 'Séance d\'entraînement'
        verbose_name_plural = 'Séances d\'entraînement'
        ordering = ['-session_date']

    def __str__(self) -> str:
        return f"{self.title} - {self.team.name} ({self.session_date.strftime('%d/%m/%Y')})"
