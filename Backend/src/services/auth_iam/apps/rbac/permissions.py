"""
Permissions DRF personnalisées — Cœur du système RBAC GESPORT.

Ces classes sont utilisées dans les views de TOUS les microservices.
Elles répondent à la question : "Est-ce que cet utilisateur a le droit de faire ça ?"

Usage dans une view :
    class MyView(APIView):
        permission_classes = [IsAuthenticated, HasClubRole('COACH')]

Fonctionnement interne :
  1. DRF appelle has_permission(request, view) avant d'exécuter la vue
  2. Si False → réponse 403 Forbidden automatique
  3. Si True → la view s'exécute normalement
"""

from rest_framework.permissions import BasePermission

from apps.rbac.models.role import Role
from apps.rbac.models.user_role import UserClubRole


def _get_club_id_from_request(request) -> int | None:
    """
    Extrait l'ID du club depuis les paramètres de la requête.
    Convention : le club_id peut être dans les query params ou le body.
    """
    return (
        request.query_params.get('club_id')
        or request.data.get('club_id')
        or request.parser_context.get('kwargs', {}).get('club_id')
    )


def user_has_role_in_club(user, club_id: int, role_codes: list[str]) -> bool:
    """
    Vérifie si un utilisateur possède l'un des rôles donnés dans un club.
    Utilisée en interne et peut être importée dans les services des autres microservices.
    """
    if not user or not user.is_authenticated:
        return False
    return UserClubRole.objects.filter(
        user=user,
        club_id=club_id,
        role__code__in=role_codes,
    ).exists()


class IsSuperAdmin(BasePermission):
    """
    Accès réservé aux SUPER_ADMIN du club spécifié.
    (Président / Direction Générale)
    """
    message = "Accès réservé aux Super Administrateurs du club."

    def has_permission(self, request, view) -> bool:
        club_id = _get_club_id_from_request(request)
        if not club_id:
            return False
        return user_has_role_in_club(request.user, int(club_id), [Role.SUPER_ADMIN])


class IsClubAdmin(BasePermission):
    """
    Accès réservé aux SUPER_ADMIN et CLUB_ADMIN du club.
    """
    message = "Accès réservé aux administrateurs du club."

    def has_permission(self, request, view) -> bool:
        club_id = _get_club_id_from_request(request)
        if not club_id:
            return False
        return user_has_role_in_club(
            request.user, int(club_id), [Role.SUPER_ADMIN, Role.CLUB_ADMIN]
        )


class IsCoach(BasePermission):
    """
    Accès réservé aux COACH, CLUB_ADMIN et SUPER_ADMIN du club.
    """
    message = "Accès réservé aux entraîneurs et administrateurs du club."

    def has_permission(self, request, view) -> bool:
        club_id = _get_club_id_from_request(request)
        if not club_id:
            return False
        return user_has_role_in_club(
            request.user, int(club_id),
            [Role.SUPER_ADMIN, Role.CLUB_ADMIN, Role.COACH]
        )


class IsTreasurer(BasePermission):
    """
    Accès réservé aux TREASURER, CLUB_ADMIN et SUPER_ADMIN du club.
    """
    message = "Accès réservé aux trésoriers et administrateurs du club."

    def has_permission(self, request, view) -> bool:
        club_id = _get_club_id_from_request(request)
        if not club_id:
            return False
        return user_has_role_in_club(
            request.user, int(club_id),
            [Role.SUPER_ADMIN, Role.CLUB_ADMIN, Role.TREASURER]
        )


class IsMedicalStaff(BasePermission):
    """
    Accès réservé au MEDICAL_STAFF, CLUB_ADMIN et SUPER_ADMIN du club.
    """
    message = "Accès réservé au personnel médical et aux administrateurs du club."

    def has_permission(self, request, view) -> bool:
        club_id = _get_club_id_from_request(request)
        if not club_id:
            return False
        return user_has_role_in_club(
            request.user, int(club_id),
            [Role.SUPER_ADMIN, Role.CLUB_ADMIN, Role.MEDICAL_STAFF]
        )


class IsLogistics(BasePermission):
    """
    Accès réservé au LOGISTICS, CLUB_ADMIN et SUPER_ADMIN du club.
    """
    message = "Accès réservé aux responsables logistique et aux administrateurs du club."

    def has_permission(self, request, view) -> bool:
        club_id = _get_club_id_from_request(request)
        if not club_id:
            return False
        return user_has_role_in_club(
            request.user, int(club_id),
            [Role.SUPER_ADMIN, Role.CLUB_ADMIN, Role.LOGISTICS]
        )


class IsMarketing(BasePermission):
    """
    Accès réservé au MARKETING, CLUB_ADMIN et SUPER_ADMIN du club.
    (Responsable communication, marketing, SMS, emailing & CMS)
    """
    message = "Accès réservé aux responsables communication/marketing et aux administrateurs du club."

    def has_permission(self, request, view) -> bool:
        club_id = _get_club_id_from_request(request)
        if not club_id:
            return False
        return user_has_role_in_club(
            request.user, int(club_id),
            [Role.SUPER_ADMIN, Role.CLUB_ADMIN, Role.MARKETING]
        )



class HasClubRole(BasePermission):
    """
    Permission générique : vérifie si l'utilisateur possède l'UN des rôles spécifiés.

    Usage :
        class MyView(APIView):
            permission_classes = [IsAuthenticated, HasClubRole]
            required_roles = [Role.COACH, Role.SUPER_ADMIN]
    """
    message = "Vous n'avez pas les permissions nécessaires dans ce club."
    required_roles: list[str] = []

    def has_permission(self, request, view) -> bool:
        club_id = _get_club_id_from_request(request)
        roles = getattr(view, 'required_roles', self.required_roles)
        if not club_id or not roles:
            return False
        return user_has_role_in_club(request.user, int(club_id), roles)
