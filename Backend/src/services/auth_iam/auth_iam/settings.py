"""
Django settings for auth_iam — Microservice #01 (Authentification & IAM).

Responsabilités :
  - Gestion des utilisateurs (AbstractUser étendu, email comme identifiant)
  - Authentification JWT (Access 60 min / Refresh 7 jours) via SimpleJWT
  - Multi-tenancy des clubs (Club → Saisons → Adhésions)
  - Contrôle d'accès basé sur les rôles (RBAC : SUPER_ADMIN, COACH, etc.)
  - 2FA activable par utilisateur (TOTP via pyotp)
"""

from datetime import timedelta
from pathlib import Path

from decouple import config, Csv

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent


# ─── Security ─────────────────────────────────────────────────────────────────
SECRET_KEY = config('SECRET_KEY', default='django-insecure-changeme-in-production')
DEBUG = config('DEBUG', default=True, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='*', cast=Csv())


# ─── Modèle utilisateur personnalisé ──────────────────────────────────────────
# On remplace le modèle User Django par défaut pour utiliser l'email comme
# identifiant de connexion principal au lieu du username.
AUTH_USER_MODEL = 'accounts.User'


# ─── Applications ─────────────────────────────────────────────────────────────
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    # Django REST Framework : expose nos modèles en API REST JSON
    'rest_framework',
    # SimpleJWT : gestion des tokens d'authentification Access + Refresh
    'rest_framework_simplejwt',
    # CORS : autorise le Frontend React (localhost:3000) à appeler l'API
    'corsheaders',
    # Filtering : permet des filtres avancés sur les endpoints list
    'django_filters',
]

LOCAL_APPS = [
    # Gestion des utilisateurs, profils, connexion, 2FA
    'apps.accounts',
    # Multi-tenancy : Clubs et Saisons sportives
    'apps.club',
    # Rôles et Permissions granulaires (RBAC)
    'apps.rbac',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS


# ─── Middleware ───────────────────────────────────────────────────────────────
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    # CORS doit être le plus haut possible dans la liste
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# ─── URLs ─────────────────────────────────────────────────────────────────────
ROOT_URLCONF = 'auth_iam.urls'


# ─── Templates ────────────────────────────────────────────────────────────────
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'auth_iam.wsgi.application'


# ─── Base de Données ──────────────────────────────────────────────────────────
# En développement : SQLite (simple, sans installation)
# En production : PostgreSQL dédié auth_db (voir docker-compose)
DATABASES = {
    'default': {
        'ENGINE': config('DB_ENGINE', default='django.db.backends.sqlite3'),
        'NAME': config('DB_NAME', default=str(BASE_DIR / 'auth_db.sqlite3')),
        'USER': config('DB_USER', default=''),
        'PASSWORD': config('DB_PASSWORD', default=''),
        'HOST': config('DB_HOST', default=''),
        'PORT': config('DB_PORT', default=''),
    }
}


# ─── Validation des mots de passe ─────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
     'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# ─── Internationalisation ─────────────────────────────────────────────────────
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Europe/Paris'
USE_I18N = True
USE_TZ = True


# ─── Fichiers statiques & médias ──────────────────────────────────────────────
STATIC_URL = 'static/'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# ─── Django REST Framework ────────────────────────────────────────────────────
# Configuration globale de l'API REST :
# - Authentification par défaut : JWT (le token Bearer dans le header Authorization)
# - Permission par défaut : l'utilisateur DOIT être connecté pour accéder à l'API
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 25,
}


# ─── JWT (JSON Web Tokens) ────────────────────────────────────────────────────
# Access Token : jeton court vérifié à CHAQUE requête API (60 min)
# Refresh Token : jeton long utilisé UNIQUEMENT pour régénérer l'Access Token
#   sans re-demander le mot de passe (7 jours)
SIMPLE_JWT = {
    # Durée de vie du token d'accès (60 minutes → sécurité maximale)
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    # Durée de vie du token de rafraîchissement (7 jours → confort utilisateur)
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    # Émet un NOUVEAU Refresh Token à chaque rafraîchissement (rotation)
    'ROTATE_REFRESH_TOKENS': True,
    # Invalide l'ancien Refresh Token après rotation (sécurité)
    'BLACKLIST_AFTER_ROTATION': False,
    # Algorithme de signature des tokens
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    # Les claims custom ajoutés dans le payload du token
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    # Type du header HTTP attendu : Authorization: Bearer <token>
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    # Clés retournées lors de la connexion
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}


# ─── CORS (Cross-Origin Resource Sharing) ────────────────────────────────────
# Autorise le Frontend React (sur localhost:3000) à appeler notre API
# En production, remplacer par la liste des domaines autorisés
CORS_ALLOW_ALL_ORIGINS = config('CORS_ALLOW_ALL_ORIGINS', default=True, cast=bool)
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='', cast=Csv())
CORS_ALLOW_CREDENTIALS = True


# ─── Email (envoi emails vérification / reset password) ───────────────────────
EMAIL_BACKEND = config(
    'EMAIL_BACKEND',
    default='django.core.mail.backends.console.EmailBackend'
)
EMAIL_HOST = config('EMAIL_HOST', default='')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@gesport.fr')


# ─── Celery (tâches asynchrones : envoi email, notifications...) ──────────────
CELERY_BROKER_URL = config('CELERY_BROKER_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = config('CELERY_RESULT_BACKEND', default='redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
