"""Selectors rbac — Requêtes de lecture DB pour les rôles."""

from django.contrib.auth import get_user_model
from django.db.models import QuerySet

# pyrefly: ignore [missing-import]
from apps.rbac.models.role import Role
# pyrefly: ignore [missing-import]
from apps.rbac.models.user_role import UserClubRole
# pyrefly: ignore [missing-import]
from apps.club.models.club import Club

User = get_user_model()


def list_roles() -> QuerySet:
    """Retourne tous les rôles disponibles dans le système."""
    return Role.objects.all().order_by('code')


def get_role_by_code(code: str) -> Role:
    return Role.objects.get(code=code)


def get_user_roles_in_club(user: User, club: Club) -> QuerySet:
    """Retourne tous les rôles d'un utilisateur dans un club donné."""
    return (
        UserClubRole.objects
        .filter(user=user, club=club)
        .select_related('role')
    )


def list_club_user_roles(club: Club) -> QuerySet:
    """Retourne toutes les attributions de rôles d'un club."""
    return (
        UserClubRole.objects
        .filter(club=club)
        .select_related('user', 'role', 'assigned_by')
        .order_by('role__code', 'user__last_name')
    )


def has_club_role(user: User, club: Club, role_code: str) -> bool:
    """Vérifie si un utilisateur a un rôle spécifique dans un club."""
    return UserClubRole.objects.filter(
        user=user, club=club, role__code=role_code
    ).exists()
