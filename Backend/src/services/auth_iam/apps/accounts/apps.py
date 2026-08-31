"""
AppConfig pour l'application accounts.

Cette application gère :
  - Les utilisateurs (User custom avec email comme identifiant)
  - Les profils utilisateur (UserProfile)
  - La 2FA (TOTP via pyotp)
"""

from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.accounts'
    verbose_name = 'Comptes & Authentification'
