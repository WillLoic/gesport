"""
Routes URL de l'application accounts.

Toutes ces routes sont accessibles sous le préfixe /api/v1/auth/accounts/
(défini dans auth_iam/urls.py)
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from apps.accounts.views.auth_view import (
    RegisterView,
    LoginView,
    UserMeView,
    UserProfileUpdateView,
    ChangePasswordView,
    Setup2FAView,
    Verify2FASetupView,
    Disable2FAView,
)

urlpatterns = [
    # ── Authentification ────────────────────────────────────────────────────────
    # POST /api/v1/auth/accounts/register/   → Inscription
    path('register/', RegisterView.as_view(), name='accounts-register'),

    # POST /api/v1/auth/accounts/login/      → Connexion (retourne access + refresh)
    path('login/', LoginView.as_view(), name='accounts-login'),

    # POST /api/v1/auth/accounts/token/refresh/ → Rafraîchit l'access token (SimpleJWT natif)
    path('token/refresh/', TokenRefreshView.as_view(), name='accounts-token-refresh'),

    # ── Profil ──────────────────────────────────────────────────────────────────
    # GET  /api/v1/auth/accounts/me/         → Mes informations
    # PUT  /api/v1/auth/accounts/me/         → Modifier mes informations de base
    path('me/', UserMeView.as_view(), name='accounts-me'),

    # PATCH /api/v1/auth/accounts/me/profile/ → Modifier mon profil étendu
    path('me/profile/', UserProfileUpdateView.as_view(), name='accounts-profile'),

    # POST /api/v1/auth/accounts/me/change-password/ → Changer mon mot de passe
    path('me/change-password/', ChangePasswordView.as_view(), name='accounts-change-password'),

    # ── 2FA ─────────────────────────────────────────────────────────────────────
    # POST /api/v1/auth/accounts/me/2fa/setup/   → Générer la clé TOTP + QR Code
    path('me/2fa/setup/', Setup2FAView.as_view(), name='accounts-2fa-setup'),

    # POST /api/v1/auth/accounts/me/2fa/verify/  → Confirmer et activer la 2FA
    path('me/2fa/verify/', Verify2FASetupView.as_view(), name='accounts-2fa-verify'),

    # POST /api/v1/auth/accounts/me/2fa/disable/ → Désactiver la 2FA
    path('me/2fa/disable/', Disable2FAView.as_view(), name='accounts-2fa-disable'),
]
