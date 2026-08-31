"""
URL racine du microservice auth_iam.

Toutes les routes sont préfixées par /api/v1/auth/ depuis l'API Gateway.
Ici, on distribue vers les 3 sous-applications métier :
  - accounts/ → inscription, connexion, profil, 2FA
  - clubs/    → clubs, saisons, adhésions
  - rbac/     → rôles, attribution de rôles
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # ── Accounts : Authentification & Profils ──────────────────────────────────
    # Exemples d'URLs exposées :
    #   POST /api/v1/auth/accounts/register/
    #   POST /api/v1/auth/accounts/login/
    #   POST /api/v1/auth/accounts/token/refresh/
    #   GET  /api/v1/auth/accounts/me/
    #   PUT  /api/v1/auth/accounts/me/change-password/
    #   POST /api/v1/auth/accounts/me/enable-2fa/
    path('api/v1/auth/accounts/', include('apps.accounts.urls')),

    # ── Club : Multi-Tenancy & Saisons ─────────────────────────────────────────
    # Exemples d'URLs exposées :
    #   POST /api/v1/auth/clubs/
    #   GET  /api/v1/auth/clubs/<slug>/
    #   POST /api/v1/auth/clubs/<slug>/seasons/
    #   POST /api/v1/auth/clubs/<slug>/members/
    path('api/v1/auth/clubs/', include('apps.club.urls')),

    # ── RBAC : Rôles & Permissions ─────────────────────────────────────────────
    # Exemples d'URLs exposées :
    #   GET  /api/v1/auth/rbac/roles/
    #   POST /api/v1/auth/rbac/assign/
    #   DEL  /api/v1/auth/rbac/revoke/
    path('api/v1/auth/rbac/', include('apps.rbac.urls')),
]

# En développement : servir les fichiers médias (avatars, logos...)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
