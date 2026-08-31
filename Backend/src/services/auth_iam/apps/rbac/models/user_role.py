"""
Modèle UserClubRole — Attribution d'un rôle à un utilisateur DANS un club.

La clé du RBAC : un même utilisateur peut avoir des rôles DIFFÉRENTS dans
des clubs DIFFÉRENTS.

Exemple :
  - Jean Dupont est SUPER_ADMIN dans "AS Montrouge"
  - Jean Dupont est MEMBER dans "BC Malakoff" (il joue au basket comme loisir)
  - Jean Dupont est COACH dans "US Paris Football"

→ Chaque UserClubRole est unique par combinaison (user, club, role).
"""

from django.conf import settings
from django.db import models
# pyrefly: ignore [missing-import]
from apps.club.models.club import Club
# pyrefly: ignore [missing-import]
from apps.rbac.models.role import Role


class UserClubRole(models.Model):
    """Attribution d'un rôle à un utilisateur dans un club spécifique."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='club_roles',
        verbose_name="Utilisateur"
    )
    club = models.ForeignKey(
        Club,
        on_delete=models.CASCADE,
        related_name='user_roles',
        verbose_name="Club"
    )
    role = models.ForeignKey(
        Role,
        on_delete=models.PROTECT,  # On ne peut pas supprimer un rôle si des utilisateurs l'ont
        related_name='assignments',
        verbose_name="Rôle"
    )

    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='role_assignments_made',
        verbose_name="Attribué par"
    )
    assigned_at = models.DateTimeField(auto_now_add=True, verbose_name="Date d'attribution")

    class Meta:
        db_table = 'auth_user_club_roles'
        verbose_name = 'Rôle utilisateur (club)'
        verbose_name_plural = 'Rôles utilisateurs (club)'
        # Un utilisateur ne peut avoir le MÊME rôle qu'UNE FOIS dans un club
        unique_together = [['user', 'club', 'role']]

    def __str__(self) -> str:
        return f"{self.user.full_name} → {self.role.code} @ {self.club.name}"
