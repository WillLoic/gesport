"""Services pour l'application club — Toute la logique métier en écriture."""

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
import datetime

# pyrefly: ignore [missing-import]
from apps.club.models.club import Club
# pyrefly: ignore [missing-import]
from apps.club.models.season import Season
# pyrefly: ignore [missing-import]
from apps.club.models.membership import UserClubMembership

User = get_user_model()


def create_club(*, name: str, creator: User, **kwargs) -> Club:
    """
    Crée un nouveau club et ajoute automatiquement le créateur comme membre admin.
    """
    club = Club.objects.create(name=name, **kwargs)
    # Le créateur est automatiquement membre de son club
    UserClubMembership.objects.create(user=creator, club=club, is_active=True)
    return club


def update_club(*, club: Club, **fields) -> Club:
    """Met à jour les champs d'un club."""
    for field, value in fields.items():
        setattr(club, field, value)
    club.save(update_fields=list(fields.keys()))
    return club


def create_season(
    *,
    club: Club,
    name: str,
    start_date: datetime.date,
    end_date: datetime.date,
    set_as_current: bool = False,
) -> Season:
    """
    Crée une nouvelle saison sportive pour un club.
    Si set_as_current=True, la saison est automatiquement définie comme courante
    (les autres saisons du club seront désactivées via le .save() du modèle).
    """
    if end_date <= start_date:
        raise ValidationError({"end_date": "La date de fin doit être après la date de début."})

    season = Season.objects.create(
        club=club,
        name=name,
        start_date=start_date,
        end_date=end_date,
        is_current=set_as_current,
    )
    return season


def add_user_to_club(*, user: User, club: Club) -> UserClubMembership:
    """
    Ajoute un utilisateur à un club.
    Si l'utilisateur était déjà membre (is_active=False), on le réactive.
    """
    membership, created = UserClubMembership.objects.get_or_create(
        user=user, club=club,
        defaults={'is_active': True}
    )
    if not created and not membership.is_active:
        # Réactivation d'un ancien membre
        membership.is_active = True
        membership.save(update_fields=['is_active'])

    return membership


def remove_user_from_club(*, user: User, club: Club) -> None:
    """
    Désactive l'adhésion d'un utilisateur (soft delete — on garde l'historique).
    """
    try:
        membership = UserClubMembership.objects.get(user=user, club=club)
        membership.is_active = False
        membership.save(update_fields=['is_active'])
    except UserClubMembership.DoesNotExist:
        raise ValidationError({"detail": "Cet utilisateur n'est pas membre de ce club."})
