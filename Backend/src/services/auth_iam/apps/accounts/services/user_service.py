"""
Services accounts — Toute la logique métier en écriture.

Règles fondamentales :
  1. Ces fonctions ne savent pas qu'HTTP existe (pas d'import request ici)
  2. Elles reçoivent des données Python propres et retournent des objets Python
  3. Elles sont 100% testables unitairement sans passer par l'API
  4. Une view appelle UN service → le service fait TOUT le travail

Logique 2FA (TOTP) :
  - pyotp génère une clé secrète unique par utilisateur
  - L'utilisateur scanne le QR code avec Google Authenticator / Authy
  - À chaque connexion, il doit saisir le code à 6 chiffres affiché dans l'app
  - Le code change toutes les 30 secondes (Time-based OTP = TOTP)
"""

import pyotp
import qrcode
import io
import base64

from django.contrib.auth import authenticate, get_user_model
from django.core.exceptions import ValidationError
# pyrefly: ignore [missing-import]
from rest_framework_simplejwt.tokens import RefreshToken

# pyrefly: ignore [missing-import]
from apps.accounts.models.profile import UserProfile

User = get_user_model()


# ─── Création d'utilisateur ───────────────────────────────────────────────────

def create_user(
    *,
    email: str,
    password: str,
    first_name: str,
    last_name: str,
    phone_number: str = '',
    sport: str = 'other',
) -> User:
    """
    Crée un nouvel utilisateur et son profil associé.

    Le profil (UserProfile) est créé ici directement pour garantir
    l'intégrité. On aurait pu utiliser un signal Django post_save,
    mais le créer explicitement dans le service est plus clair et testable.
    """
    if User.objects.filter(email__iexact=email).exists():
        raise ValidationError({"email": "Un compte avec cet email existe déjà."})

    user = User.objects.create_user(
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
        phone_number=phone_number,
        sport=sport,
    )

    # Création automatique du profil associé
    UserProfile.objects.create(user=user)

    return user


# ─── Authentification & JWT ───────────────────────────────────────────────────

def authenticate_user(*, email: str, password: str) -> dict:
    """
    Authentifie un utilisateur et retourne une paire de tokens JWT.

    Retourne :
    {
        "user": <User>,
        "access": "eyJ...",   ← valide 60 min
        "refresh": "eyJ..."   ← valide 7 jours
    }

    Lève ValueError si les credentials sont invalides ou si le compte est inactif.
    """
    user = authenticate(email=email, password=password)

    if user is None:
        raise ValidationError({"detail": "Email ou mot de passe incorrect."})

    if not user.is_active:
        raise ValidationError({"detail": "Ce compte est désactivé. Contactez un administrateur."})

    # Génération des tokens JWT via SimpleJWT
    # RefreshToken.for_user() crée automatiquement les deux tokens
    refresh = RefreshToken.for_user(user)

    return {
        'user': user,
        'access': str(refresh.access_token),   # Token court (60 min)
        'refresh': str(refresh),               # Token long (7 jours)
    }


def verify_2fa_and_get_tokens(*, user: User, totp_code: str) -> dict:
    """
    Vérifie le code TOTP et retourne les tokens JWT si valide.
    Utilisé uniquement si la 2FA est activée pour cet utilisateur.
    """
    totp = pyotp.TOTP(user.totp_secret)
    # Fenêtre de ±1 période (30s) pour tolérer les légers décalages d'horloge
    if not totp.verify(totp_code, valid_window=1):
        raise ValidationError({"totp_code": "Code 2FA invalide ou expiré."})

    refresh = RefreshToken.for_user(user)
    return {
        'user': user,
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }


# ─── Gestion du profil ────────────────────────────────────────────────────────

def update_user_profile(*, user: User, user_data: dict = None, profile_data: dict = None) -> User:
    """
    Met à jour les informations du User et/ou de son UserProfile.

    Séparation intentionnelle user_data / profile_data car
    les deux sont dans des tables différentes.
    """
    if user_data:
        for field, value in user_data.items():
            setattr(user, field, value)
        user.save(update_fields=list(user_data.keys()))

    if profile_data:
        profile = user.profile
        for field, value in profile_data.items():
            setattr(profile, field, value)
        profile.save(update_fields=list(profile_data.keys()))

    return user


def change_password(*, user: User, old_password: str, new_password: str) -> None:
    """
    Change le mot de passe de l'utilisateur après vérification de l'ancien.
    Lève ValueError si l'ancien mot de passe est incorrect.
    """
    if not user.check_password(old_password):
        raise ValidationError({"old_password": "L'ancien mot de passe est incorrect."})
    user.set_password(new_password)
    user.save(update_fields=['password'])


# ─── Gestion de la 2FA ────────────────────────────────────────────────────────

def generate_2fa_setup(*, user: User) -> dict:
    """
    Génère une clé secrète TOTP et retourne l'URI QR Code.

    Flux complet :
    1. On génère une clé secrète aléatoire (32 caractères base32)
    2. On crée une URI TOTP compatible Google Authenticator
    3. On génère un QR Code encodé en base64 pour l'afficher dans le frontend
    4. La clé est stockée temporairement (l'activation sera confirmée par verify_2fa_setup)
    """
    secret = pyotp.random_base32()

    # Sauvegarde temporaire de la clé (pas encore activée)
    user.totp_secret = secret
    print(secret)
    user.save(update_fields=['totp_secret'])

    # URI TOTP compatible avec les apps comme Google Authenticator
    totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name=user.email,
        issuer_name='GESPORT'
    )

    # Génération du QR Code en image base64 (pour l'afficher directement dans React)
    qr = qrcode.QRCode(version=1, box_size=8, border=2)
    qr.add_data(totp_uri)
    qr.make(fit=True)
    img = qr.make_image(fill_color='black', back_color='white')
    buffer = io.BytesIO()
    img.save(buffer)
    qr_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

    return {
        'qr_code_uri': f'data:image/png;base64,{qr_base64}',
        'totp_secret': secret,
    }


def verify_and_activate_2fa(*, user: User, totp_code: str) -> None:
    """
    Vérifie le code TOTP et active définitivement la 2FA.
    L'utilisateur doit scanner le QR code puis saisir le code généré.
    """
    if not user.totp_secret:
        raise ValidationError({"detail": "Aucune clé 2FA générée. Lancez d'abord le setup."})

    totp = pyotp.TOTP(user.totp_secret)
    if not totp.verify(totp_code, valid_window=1):
        raise ValidationError({"totp_code": "Code 2FA invalide. Vérifiez votre application d'authentification."})

    user.is_2fa_enabled = True
    user.save(update_fields=['is_2fa_enabled'])


def disable_2fa(*, user: User, password: str) -> None:
    """
    Désactive la 2FA après confirmation du mot de passe.
    """
    if not user.check_password(password):
        raise ValidationError({"password": "Mot de passe incorrect."})
    user.is_2fa_enabled = False
    user.totp_secret = ''
    user.save(update_fields=['is_2fa_enabled', 'totp_secret'])
