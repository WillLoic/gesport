"""Views pour l'application rbac."""

from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.rbac.selectors.rbac_selector import list_roles, list_club_user_roles, get_user_roles_in_club
from apps.rbac.serializers.rbac_serializer import (
    RoleSerializer, UserClubRoleSerializer, AssignRoleSerializer, RevokeRoleSerializer,
)
from apps.rbac.services.rbac_service import assign_role_to_user, revoke_role_from_user
from apps.rbac.permissions import IsClubAdmin
from apps.accounts.selectors.user_selector import get_user_by_email
from apps.club.selectors.club_selector import get_club_by_id


class RoleListView(APIView):
    """
    GET /api/v1/auth/rbac/roles/
    Retourne la liste de tous les rôles disponibles dans le système.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        roles = list_roles()
        return Response(RoleSerializer(roles, many=True).data)


class AssignRoleView(APIView):
    """
    POST /api/v1/auth/rbac/assign/
    Attribue un rôle à un utilisateur dans un club.
    Réservé aux admins du club.
    """
    permission_classes = [IsAuthenticated, IsClubAdmin]

    def post(self, request: Request) -> Response:
        serializer = AssignRoleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user = get_user_by_email(serializer.validated_data['user_email'])
            club = get_club_by_id(serializer.validated_data['club_id'])
            assignment = assign_role_to_user(
                user=user,
                club=club,
                role_code=serializer.validated_data['role_code'],
                assigned_by=request.user,
            )
        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {
                "detail": f"Rôle '{serializer.validated_data['role_code']}' attribué avec succès.",
                "assignment": UserClubRoleSerializer(assignment).data,
            },
            status=status.HTTP_201_CREATED
        )


class RevokeRoleView(APIView):
    """
    DELETE /api/v1/auth/rbac/revoke/
    Révoque un rôle d'un utilisateur dans un club.
    Réservé aux admins du club.
    """
    permission_classes = [IsAuthenticated, IsClubAdmin]

    def delete(self, request: Request) -> Response:
        serializer = RevokeRoleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user = get_user_by_email(serializer.validated_data['user_email'])
            club = get_club_by_id(serializer.validated_data['club_id'])
            revoke_role_from_user(
                user=user,
                club=club,
                role_code=serializer.validated_data['role_code'],
            )
        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {"detail": f"Rôle '{serializer.validated_data['role_code']}' révoqué avec succès."},
            status=status.HTTP_200_OK
        )


class UserRolesInClubView(APIView):
    """
    GET /api/v1/auth/rbac/clubs/<club_id>/users/<user_email>/roles/
    Retourne les rôles d'un utilisateur dans un club donné.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request: Request, club_id: int, user_email: str) -> Response:
        try:
            user = get_user_by_email(user_email)
            club = get_club_by_id(club_id)
        except Exception:
            return Response({"detail": "Utilisateur ou club introuvable."}, status=status.HTTP_404_NOT_FOUND)

        roles = get_user_roles_in_club(user=user, club=club)
        return Response(UserClubRoleSerializer(roles, many=True).data)


class ClubRolesListView(APIView):
    """
    GET /api/v1/auth/rbac/clubs/<club_id>/roles/
    Retourne toutes les attributions de rôles d'un club.
    """
    permission_classes = [IsAuthenticated, IsClubAdmin]

    def get(self, request: Request, club_id: int) -> Response:
        try:
            club = get_club_by_id(club_id)
        except Exception:
            return Response({"detail": "Club introuvable."}, status=status.HTTP_404_NOT_FOUND)

        assignments = list_club_user_roles(club=club)
        return Response(UserClubRoleSerializer(assignments, many=True).data)
