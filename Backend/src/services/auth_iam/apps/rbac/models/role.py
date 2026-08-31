"""
Modèle Role — Définit les rôles métier GESPORT.

Les rôles sont les niveaux d'accès définis dans le README :
  - SUPER_ADMIN   : Président, accès total
  - CLUB_ADMIN    : Administrateur délégué du club
  - TREASURER     : Trésorier, accès aux finances
  - COACH         : Directeur sportif / Entraîneur
  - MEDICAL_STAFF : Médecin / Kinésithérapeute
  - LOGISTICS     : Responsable matériel & flotte
  - MEMBER        : Joueur / Adhérent / Parent

Les rôles 'système' (is_system_role=True) sont créés au démarrage via
la commande de management 'init_roles' et ne peuvent pas être supprimés.
"""

from django.db import models


class Role(models.Model):
    """Définition d'un rôle dans GESPORT."""

    # Codes standardisés (utilisés dans les permissions DRF)
    SUPER_ADMIN = 'SUPER_ADMIN'
    CLUB_ADMIN = 'CLUB_ADMIN'
    TREASURER = 'TREASURER'
    COACH = 'COACH'
    MEDICAL_STAFF = 'MEDICAL_STAFF'
    LOGISTICS = 'LOGISTICS'
    MARKETING = 'MARKETING'
    MEMBER = 'MEMBER'

    ROLE_CHOICES = [
        (SUPER_ADMIN, 'Président / Super Administrateur'),
        (CLUB_ADMIN, 'Administrateur du club'),
        (TREASURER, 'Trésorier / Comptable'),
        (COACH, 'Directeur Sportif / Entraîneur'),
        (MEDICAL_STAFF, 'Médecin / Kinésithérapeute'),
        (LOGISTICS, 'Responsable Matériel & Logistique'),
        (MARKETING, 'Responsable Communication & Marketing'),
        (MEMBER, 'Joueur / Adhérent / Parent'),
    ]

    code = models.CharField(
        max_length=30,
        unique=True,
        choices=ROLE_CHOICES,
        verbose_name="Code du rôle",
        help_text="Identifiant unique utilisé dans le code (ex: 'COACH')"
    )
    name = models.CharField(
        max_length=100,
        verbose_name="Nom affiché"
    )
    description = models.TextField(
        blank=True,
        default='',
        verbose_name="Description des droits"
    )
    is_system_role = models.BooleanField(
        default=True,
        verbose_name="Rôle système",
        help_text="Les rôles système sont créés automatiquement et ne peuvent pas être supprimés."
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'auth_roles'
        verbose_name = 'Rôle'
        verbose_name_plural = 'Rôles'
        ordering = ['code']

    def __str__(self) -> str:
        return f"{self.name} ({self.code})"
