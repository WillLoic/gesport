"""
Modèle User personnalisé pour GESPORT.

Pourquoi un modèle custom ?
  - Django utilise par défaut le 'username' pour la connexion.
  - Ici, on utilise l'EMAIL comme identifiant principal (plus naturel et moderne).
  - On ajoute des champs métier : téléphone, 2FA, vérification d'email.

La règle fondamentale : il faut toujours créer son User model custom
AVANT la première migration. Impossible de changer après sans tout recréer.
"""

import uuid
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    """
    Manager custom pour créer des utilisateurs avec l'email comme identifiant.
    Remplace le mécanisme par défaut de Django qui utilise 'username'.
    """

    def create_user(self, email: str, password: str = None, **extra_fields):
        """Crée et sauvegarde un utilisateur standard."""
        if not email:
            raise ValueError("L'adresse email est obligatoire.")
        email = self.normalize_email(email)
        extra_fields.setdefault('is_active', True)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # Hash le mot de passe via bcrypt/pbkdf2
        user.save(using=self._db)
        return user

    def create_superuser(self, email: str, password: str = None, **extra_fields):
        """Crée un super-admin (accès Django admin)."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError("Le superuser doit avoir is_staff=True.")
        if extra_fields.get('is_superuser') is not True:
            raise ValueError("Le superuser doit avoir is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Modèle User étendu de GESPORT.

    Champs supprimés par rapport à AbstractUser par défaut :
      - 'username' → remplacé par email comme identifiant unique

    Champs ajoutés :
      - phone_number : coordonnées de contact
      - avatar       : photo de profil
      - is_email_verified : l'utilisateur a confirmé son email
      - is_2fa_enabled    : la 2FA est-elle activée ?
      - totp_secret       : clé secrète pour générer les codes TOTP (2FA)
    """

    # On supprime le username (Django le rend obligatoire par défaut)
    username = None

    # Identifiant unique de connexion
    email = models.EmailField(
        unique=True,
        verbose_name="Adresse email",
        help_text="Utilisée comme identifiant de connexion."
    )

    SPORT_CHOICES = [
        ('football', 'Football'),
        ('basketball', 'Basketball'),
        ('volleyball', 'Volleyball'),
        ('handball', 'Handball'),
        ('rugby', 'Rugby'),
        ('tennis', 'Tennis & Padel'),
        ('other', 'Autre / Général'),
    ]

    # Coordonnées & Sport
    phone_number = models.CharField(
        max_length=20,
        blank=True,
        default='',
        verbose_name="Numéro de téléphone"
    )

    sport = models.CharField(
        max_length=30,
        choices=SPORT_CHOICES,
        default='other',
        blank=True,
        verbose_name="Sport principal",
        help_text="Sport principal pratiqué ou encadré par l'utilisateur."
    )

    # Photo de profil (stockée dans MEDIA_ROOT/avatars/)
    avatar = models.ImageField(
        upload_to='avatars/',
        null=True,
        blank=True,
        verbose_name="Avatar"
    )

    # Vérification d'email
    is_email_verified = models.BooleanField(
        default=False,
        verbose_name="Email vérifié",
        help_text="True si l'utilisateur a cliqué sur le lien de vérification."
    )

    # Authentification à deux facteurs (TOTP : Time-based One-Time Password)
    is_2fa_enabled = models.BooleanField(
        default=False,
        verbose_name="2FA activée",
        help_text="Si activée, un code TOTP sera demandé à chaque connexion."
    )
    totp_secret = models.CharField(
        max_length=64,
        blank=True,
        default='',
        verbose_name="Clé secrète TOTP",
        help_text="Clé secrète générée pour l'app d'authentification (ex: Google Authenticator)."
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # ─── Configuration du modèle ───────────────────────────────────────────────
    # L'email devient l'identifiant de connexion (à la place du username)
    USERNAME_FIELD = 'email'
    # Champs demandés en plus lors de 'createsuperuser'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    # Notre manager custom (obligatoire quand on supprime username)
    objects = UserManager()

    class Meta:
        db_table = 'auth_users'
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f"{self.get_full_name()} <{self.email}>"

    @property
    def full_name(self) -> str:
        return self.get_full_name() or self.email
