"""Selectors pour l'application club — Toutes les requêtes de lecture DB."""

from django.db.models import QuerySet

# pyrefly: ignore [missing-import]
from apps.club.models.club import Club
# pyrefly: ignore [missing-import]
from apps.club.models.season import Season
# pyrefly: ignore [missing-import]
from apps.club.models.membership import UserClubMembership


def get_club_by_id(club_id: int) -> Club:
    return Club.objects.get(pk=club_id)


def get_club_by_slug(slug: str) -> Club:
    return Club.objects.get(slug=slug)


def list_all_clubs(*, is_active: bool = True) -> QuerySet:
    return Club.objects.filter(is_active=is_active).order_by('name')


def list_user_clubs(user) -> QuerySet:
    """Retourne tous les clubs dont l'utilisateur est membre actif."""
    return Club.objects.filter(
        members__user=user,
        members__is_active=True,
    ).order_by('name')


def get_active_season(club: Club) -> Season | None:
    """Retourne la saison en cours d'un club, ou None."""
    try:
        return Season.objects.get(club=club, is_current=True)
    except Season.DoesNotExist:
        return None


def list_club_seasons(club: Club) -> QuerySet:
    return Season.objects.filter(club=club).order_by('-start_date')


def list_club_members(club: Club, *, is_active: bool = True) -> QuerySet:
    return (
        UserClubMembership.objects
        .filter(club=club, is_active=is_active)
        .select_related('user', 'user__profile')
        .order_by('user__last_name')
    )


def get_membership(user, club: Club) -> UserClubMembership:
    return UserClubMembership.objects.get(user=user, club=club)
