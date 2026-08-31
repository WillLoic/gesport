"""
Modèle UserProfile — informations complémentaires du profil utilisateur.

Séparé de User pour :
  1. Garder le modèle User léger (authentification seulement)
  2. Le profil peut évoluer sans toucher au cœur de l'auth
  3. Respecte le principe de responsabilité unique (SRP)

Relation : Un User a exactement UN UserProfile (OneToOne).
"""

from django.conf import settings
from django.db import models


class UserProfile(models.Model):
    """
    Profil étendu de l'utilisateur : informations personnelles & de contact.
    Créé automatiquement à la création du User (via signal post_save).
    """

    # Lien direct vers le User (supprimé si le User est supprimé)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile',
        verbose_name="Utilisateur"
    )

    # Informations personnelles
    date_of_birth = models.DateField(
        null=True,
        blank=True,
        verbose_name="Date de naissance"
    )
    gender = models.CharField(
        max_length=10,
        choices=[
            ('M', 'Masculin'),
            ('F', 'Féminin'),
            ('OTHER', 'Autre'),
        ],
        blank=True,
        default='',
        verbose_name="Genre"
    )
    nationality = models.CharField(
        max_length=60,
        blank=True,
        default='',
        verbose_name="Nationalité"
    )

    # Adresse
    address_line1 = models.CharField(max_length=200, blank=True, default='', verbose_name="Adresse")
    address_line2 = models.CharField(max_length=200, blank=True, default='', verbose_name="Complément d'adresse")
    city = models.CharField(max_length=100, blank=True, default='', verbose_name="Ville")
    postal_code = models.CharField(max_length=20, blank=True, default='', verbose_name="Code postal")
    country = models.CharField(max_length=100, blank=True, default='France', verbose_name="Pays")

    # Contact d'urgence (utile pour les joueurs mineurs)
    emergency_contact_name = models.CharField(
        max_length=100,
        blank=True,
        default='',
        verbose_name="Contact d'urgence (nom)"
    )
    emergency_contact_phone = models.CharField(
        max_length=20,
        blank=True,
        default='',
        verbose_name="Contact d'urgence (téléphone)"
    )

    # Bio / présentation
    bio = models.TextField(
        blank=True,
        default='',
        verbose_name="Biographie",
        help_text="Courte présentation affichée sur le profil public."
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'auth_user_profiles'
        verbose_name = 'Profil utilisateur'
        verbose_name_plural = 'Profils utilisateurs'

    def __str__(self) -> str:
        return f"Profil de {self.user.full_name}"

    @property
    def age(self) -> int | None:
        """Calcule l'âge à partir de la date de naissance."""
        if not self.date_of_birth:
            return None
        from datetime import date
        today = date.today()
        dob = self.date_of_birth
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
