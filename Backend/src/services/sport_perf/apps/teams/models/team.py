"""
Modèle Team & TeamPlayer — Gestion des équipes, effectifs et compositions.
"""

from django.db import models
from apps.membres.models.member import Member


class Team(models.Model):
    """Représente une équipe du club (ex: "Seniors A Football", "U18 Garçons Basketball")."""

    club_id = models.IntegerField(verbose_name="ID du Club", db_index=True)
    name = models.CharField(max_length=150, verbose_name="Nom de l'équipe")
    sport_type = models.CharField(max_length=30, default='football', verbose_name="Sport")
    category = models.CharField(max_length=40, default='Senior Régionale', verbose_name="Catégorie")
    head_coach_name = models.CharField(max_length=150, blank=True, default='', verbose_name="Entraîneur principal")
    head_coach_id = models.IntegerField(null=True, blank=True, verbose_name="ID Coach IAM")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sport_teams'
        verbose_name = 'Équipe'
        verbose_name_plural = 'Équipes'
        ordering = ['category', 'name']

    def __str__(self) -> str:
        return f"{self.name} ({self.sport_type})"


class TeamPlayer(models.Model):
    """Rattachement d'un joueur (Member) à une équipe."""

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='players', verbose_name="Équipe")
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='teams', verbose_name="Joueur")
    jersey_number = models.IntegerField(null=True, blank=True, verbose_name="Numéro de maillot")
    position = models.CharField(max_length=50, blank=True, default='', verbose_name="Poste principal")

    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sport_team_players'
        verbose_name = 'Joueur d\'équipe'
        verbose_name_plural = 'Joueurs d\'équipe'
        unique_together = [['team', 'member']]

    def __str__(self) -> str:
        return f"#{self.jersey_number or '-'} {self.member.full_name} ({self.team.name})"
