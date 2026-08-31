"""
Views (Controllers HTTP) pour l'application accounts.

Principe fondamental : Les views sont LÉGÈRES.
  - Elles reçoivent la requête HTTP
  - Elles valident les données via les Serializers
  - Elles appellent le Service ou Selector approprié
  - Elles retournent la réponse JSON

Elles ne contiennent JAMAIS de logique métier ni de requêtes ORM.
"""

from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

# pyrefly: ignore [missing-import]
from apps.accounts.selectors.user_selector import get_user_by_id
# pyrefly: ignore [missing-import]
from apps.accounts.serializers.user_serializer import (
    ChangePasswordSerializer,
    Enable2FASerializer,
    UserDetailSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    UserRegistrationSerializer,
    UserUpdateSerializer,
    Verify2FASerializer,
)
# pyrefly: ignore [missing-import]
from apps.accounts.services.user_service import (
    authenticate_user,
    change_password,
    disable_2fa,
    generate_2fa_setup,
    update_user_profile,
    verify_2fa_and_get_tokens,
    verify_and_activate_2fa,
)


class RegisterView(APIView):
    """
    POST /api/v1/auth/accounts/register/

    Inscription d'un nouvel utilisateur.
    Endpoint public : permission AllowAny (pas besoin d'être connecté).
    """
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)  # Retourne 400 automatiquement si invalide

        try:
            user = serializer.save()
        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {
                "detail": "Compte créé avec succès. Vérifiez votre email pour activer votre compte.",
                "user": UserDetailSerializer(user).data,
            },
            status=status.HTTP_201_CREATED
        )


class LoginView(APIView):
    """
    POST /api/v1/auth/accounts/login/

    Connexion d'un utilisateur. Retourne une paire de tokens JWT.
    Si la 2FA est activée, un code TOTP est également requis.
    """
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        totp_code = serializer.validated_data.get('totp_code', '')

        try:
            result = authenticate_user(email=email, password=password)
            user = result['user']

            # Si la 2FA est activée → vérifier le code TOTP avant d'émettre les tokens
            if user.is_2fa_enabled:
                if not totp_code:
                    return Response(
                        {
                            "requires_2fa": True,
                            "detail": "Un code 2FA est requis pour finaliser la connexion."
                        },
                        status=status.HTTP_200_OK
                    )
                result = verify_2fa_and_get_tokens(user=user, totp_code=totp_code)

        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_401_UNAUTHORIZED)

        return Response(
            {
                "access": result['access'],
                "refresh": result['refresh'],
                "user": UserDetailSerializer(result['user']).data,
            },
            status=status.HTTP_200_OK
        )


class UserMeView(APIView):
    """
    GET  /api/v1/auth/accounts/me/    → Récupère les infos de l'utilisateur connecté
    PUT  /api/v1/auth/accounts/me/    → Met à jour les infos de base (nom, téléphone, avatar)
    PATCH /api/v1/auth/accounts/me/profile/ → Met à jour le profil étendu
    """
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        """Retourne les informations complètes de l'utilisateur connecté."""
        user = get_user_by_id(request.user.id)
        serializer = UserDetailSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request: Request) -> Response:
        """Met à jour les informations de base de l'utilisateur."""
        serializer = UserUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        user = update_user_profile(
            user=request.user,
            user_data=serializer.validated_data,
        )

        return Response(UserDetailSerializer(user).data, status=status.HTTP_200_OK)


class UserProfileUpdateView(APIView):
    """
    PATCH /api/v1/auth/accounts/me/profile/
    Met à jour les informations étendues du profil (adresse, urgences, bio...).
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request: Request) -> Response:
        serializer = UserProfileSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        user = update_user_profile(
            user=request.user,
            profile_data=serializer.validated_data,
        )

        return Response(UserDetailSerializer(user).data, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    """
    POST /api/v1/auth/accounts/me/change-password/
    Permet à l'utilisateur connecté de changer son mot de passe.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            change_password(
                user=request.user,
                old_password=serializer.validated_data['old_password'],
                new_password=serializer.validated_data['new_password'],
            )
        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {"detail": "Mot de passe modifié avec succès."},
            status=status.HTTP_200_OK
        )


# ─── Vues 2FA ──────────────────────────────────────────────────────────────────

class Setup2FAView(APIView):
    """
    POST /api/v1/auth/accounts/me/2fa/setup/
    Génère la clé TOTP et le QR Code pour configurer l'app d'authentification.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        result = generate_2fa_setup(user=request.user)
        serializer = Enable2FASerializer(result)
        return Response(
            {
                **serializer.data,
                "instruction": (
                    "Scannez ce QR Code avec Google Authenticator ou Authy, "
                    "puis validez avec le code généré."
                )
            },
            status=status.HTTP_200_OK
        )


class Verify2FASetupView(APIView):
    """
    POST /api/v1/auth/accounts/me/2fa/verify/
    Confirme l'activation de la 2FA avec le code TOTP scanné.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        serializer = Verify2FASerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            verify_and_activate_2fa(
                user=request.user,
                totp_code=serializer.validated_data['totp_code'],
            )
        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {"detail": "2FA activée avec succès. Votre compte est maintenant sécurisé."},
            status=status.HTTP_200_OK
        )


class Disable2FAView(APIView):
    """
    POST /api/v1/auth/accounts/me/2fa/disable/
    Désactive la 2FA après confirmation du mot de passe.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        password = request.data.get('password', '')
        if not password:
            return Response(
                {"password": "Le mot de passe est requis pour désactiver la 2FA."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            disable_2fa(user=request.user, password=password)
        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {"detail": "2FA désactivée avec succès."},
            status=status.HTTP_200_OK
        )
