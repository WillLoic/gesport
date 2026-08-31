"""
Modèles MatchEvent, Callup et MatchPlayerStats — Gestion des compétitions et feuilles de match.
"""

from django.db import models
from apps.teams.models.team import Team
from apps.membres.models.member import Member


class MatchEvent(models.Model):
    """Représente un match / compétition sportive."""

    STATUS_CHOICES = [
        ('A venir', 'À venir'),
        ('En cours', 'En cours'),
        ('Terminé', 'Terminé'),
        ('Reporté', 'Reporté'),
        ('Annulé', 'Annulé'),
    ]

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='matches', verbose_name="Équipe")
    opponent_name = models.CharField(max_length=150, verbose_name="Adversaire")
    is_home = models.BooleanField(default=True, verbose_name="Match à domicile")
    match_date = models.DateTimeField(verbose_name="Date et heure du match")
    venue = models.CharField(max_length=200, blank=True, default='', verbose_name="Lieu / Gymnase / Stade")

    score_home = models.IntegerField(null=True, blank=True, verbose_name="Score Domicile")
    score_away = models.IntegerField(null=True, blank=True, verbose_name="Score Extérieur")
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='A venir')

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sport_matches'
        verbose_name = 'Match'
        verbose_name_plural = 'Matchs'
        ordering = ['-match_date']

    def __str__(self) -> str:
        loc = "VS" if self.is_home else "@"
        return f"{self.team.name} {loc} {self.opponent_name} ({self.match_date.strftime('%d/%m/%Y')})"


class Callup(models.Model):
    """Convocation d'un joueur à un match."""

    RESPONSE_CHOICES = [
        ('Convoqué', 'Convoqué'),
        ('Présent', 'Présent'),
        ('Absent', 'Absent'),
        ('Excusé', 'Excusé'),
    ]

    match = models.ForeignKey(MatchEvent, on_delete=models.CASCADE, related_name='callups', verbose_name="Match")
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='callups', verbose_name="Joueur")
    status = models.CharField(max_length=30, choices=RESPONSE_CHOICES, default='Convoqué')
    notes = models.CharField(max_length=200, blank=True, default='', verbose_name="Remarques convocation")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sport_callups'
        verbose_name = 'Convocation'
        verbose_name_plural = 'Convocations'
        unique_together = [['match', 'member']]

    def __str__(self) -> str:
        return f"Convocation {self.member.full_name} → {self.match}"


class MatchPlayerStats(models.Model):
    """Statistiques individuelles d'un joueur pour un match donné."""

    match = models.ForeignKey(MatchEvent, on_delete=models.CASCADE, related_name='player_stats', verbose_name="Match")
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='match_stats', verbose_name="Joueur")

    points = models.IntegerField(default=0, verbose_name="Points / Buts")
    assists = models.IntegerField(default=0, verbose_name="Passes décisives")
    rebounds = models.IntegerField(default=0, verbose_name="Rebonds / Arrêts")
    fouls = models.IntegerField(default=0, verbose_name="Fautes / Cartons")
    rating = models.FloatField(default=7.0, verbose_name="Note du match (/10)")
    is_mvp = models.BooleanField(default=False, verbose_name="Joueur du match (MVP)")

    class Meta:
        db_table = 'sport_match_player_stats'
        verbose_name = 'Statistique Joueur Match'
        verbose_name_plural = 'Statistiques Joueurs Match'
        unique_together = [['match', 'member']]
