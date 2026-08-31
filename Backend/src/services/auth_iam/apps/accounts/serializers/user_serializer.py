"""
Serializers DRF pour l'application accounts.

Rôle des serializers :
  - ENTRÉE  : valider les données JSON reçues depuis le client (champs requis, format, contraintes)
  - SORTIE  : formater les données Python en JSON propre pour la réponse

On ne met JAMAIS de logique métier ici → tout va dans services/.
"""

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

# pyrefly: ignore [missing-import]
from apps.accounts.models.profile import UserProfile

User = get_user_model()


# ─── Inscription ──────────────────────────────────────────────────────────────

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Valide les données d'inscription et crée un nouvel utilisateur.

    Entrée JSON attendue :
    {
        "email": "coach@gesport.fr",
        "password": "MonMotDePasse123!",
        "password_confirm": "MonMotDePasse123!",
        "first_name": "Jean",
        "last_name": "Dupont",
        "phone_number": "0612345678"  (optionnel)
    }
    """

    password = serializers.CharField(
        write_only=True,           # N'apparaît JAMAIS dans la réponse JSON
        required=True,
        validators=[validate_password],  # Applique les règles Django de complexité
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ['email', 'password', 'password_confirm', 'first_name', 'last_name', 'phone_number', 'sport']
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def validate(self, attrs: dict) -> dict:
        """Vérifie que les deux mots de passe correspondent."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError(
                {"password_confirm": "Les mots de passe ne correspondent pas."}
            )
        return attrs

    def create(self, validated_data: dict) -> User:
        """Délègue la création au service (jamais de logique ici)."""
        # pyrefly: ignore [missing-import]
        from apps.accounts.services.user_service import create_user
        validated_data.pop('password_confirm')
        return create_user(**validated_data)


# ─── Connexion ────────────────────────────────────────────────────────────────

class UserLoginSerializer(serializers.Serializer):
    """
    Valide les credentials de connexion.

    Entrée JSON attendue :
    {
        "email": "coach@gesport.fr",
        "password": "MonMotDePasse123!"
    }
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    # Optionnel : code 2FA si l'utilisateur a activé la 2FA
    totp_code = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=6,
        help_text="Code à 6 chiffres de l'application d'authentification (si 2FA activée)."
    )


# ─── Profil utilisateur ───────────────────────────────────────────────────────

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer pour lire et mettre à jour le profil étendu."""

    age = serializers.ReadOnlyField()  # Propriété calculée

    class Meta:
        model = UserProfile
        fields = [
            'date_of_birth', 'gender', 'nationality',
            'address_line1', 'address_line2', 'city', 'postal_code', 'country',
            'emergency_contact_name', 'emergency_contact_phone',
            'bio', 'age',
        ]


class UserDetailSerializer(serializers.ModelSerializer):
    """
    Retourne les informations complètes de l'utilisateur connecté (endpoint /me/).
    Inclut le profil imbriqué.
    """

    profile = UserProfileSerializer(read_only=True)
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone_number', 'sport', 'avatar',
            'is_email_verified', 'is_2fa_enabled',
            'profile', 'created_at',
        ]


class UserUpdateSerializer(serializers.ModelSerializer):
    """Met à jour les informations de base du User (prénom, nom, téléphone, sport, avatar)."""

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone_number', 'sport', 'avatar']


# ─── Changement de mot de passe ───────────────────────────────────────────────

class ChangePasswordSerializer(serializers.Serializer):
    """
    Valide le changement de mot de passe.

    Entrée JSON attendue :
    {
        "old_password": "AncienMotDePasse123!",
        "new_password": "NouveauMotDePasse456!",
        "new_password_confirm": "NouveauMotDePasse456!"
    }
    """
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs: dict) -> dict:
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError(
                {"new_password_confirm": "Les nouveaux mots de passe ne correspondent pas."}
            )
        return attrs


# ─── 2FA ──────────────────────────────────────────────────────────────────────

class Enable2FASerializer(serializers.Serializer):
    """Réponse lors de l'activation de la 2FA : retourne l'URI QR Code."""
    qr_code_uri = serializers.CharField(read_only=True)
    totp_secret = serializers.CharField(read_only=True)


class Verify2FASerializer(serializers.Serializer):
    """Valide le code TOTP pour confirmer l'activation de la 2FA."""
    totp_code = serializers.CharField(required=True, max_length=6, min_length=6)
