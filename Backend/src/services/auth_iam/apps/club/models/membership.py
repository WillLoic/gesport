"""
Modèle UserClubMembership — Table d'association User ↔ Club.

C'est la pièce centrale du multi-tenancy :
  - Un utilisateur peut appartenir à PLUSIEURS clubs (entraîneur dans 2 clubs)
  - Un club peut avoir PLUSIEURS utilisateurs
  - L'appartenance peut être active ou inactive (ex: ancien membre)

Cette table est distincte de UserClubRole (dans rbac/) car :
  - L'appartenance = "l'utilisateur fait partie de ce club"
  - Le rôle = "l'utilisateur a tel niveau de permission dans ce club"
  Ces deux notions sont indépendantes et évoluent séparément.
"""

from django.conf import settings
from django.db import models
# pyrefly: ignore [missing-import]
from apps.club.models.club import Club


class UserClubMembership(models.Model):
    """
    Association entre un utilisateur et un club.
    La table pivot du multi-tenancy GESPORT.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='club_memberships',
        verbose_name="Utilisateur"
    )
    club = models.ForeignKey(
        Club,
        on_delete=models.CASCADE,
        related_name='members',
        verbose_name="Club"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Adhésion active",
        help_text="Si False, l'utilisateur n'a plus accès aux données de ce club."
    )

    # Timestamps
    joined_at = models.DateTimeField(auto_now_add=True, verbose_name="Date d'adhésion")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'auth_user_club_memberships'
        verbose_name = 'Adhésion club'
        verbose_name_plural = 'Adhésions club'
        # Un utilisateur ne peut être rattaché qu'UNE FOIS au même club
        unique_together = [['user', 'club']]

    def __str__(self) -> str:
        status = "actif" if self.is_active else "inactif"
        return f"{self.user.full_name} → {self.club.name} ({status})"
