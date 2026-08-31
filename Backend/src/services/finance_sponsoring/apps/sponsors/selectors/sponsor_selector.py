"""
Selectors (requêtes ORM) pour l'application sponsors.
"""

from typing import Optional
from django.db.models import QuerySet
from apps.sponsors.models.sponsor import Sponsor, SponsorshipPack, SponsorshipContract


def get_sponsors_for_club(club_id: int, status: Optional[str] = None) -> QuerySet[Sponsor]:
    """Récupère tous les sponsors d'un club avec filtre statut optionnel."""
    qs = Sponsor.objects.filter(club_id=club_id)
    if status:
        qs = qs.filter(status=status)
    return qs.order_by('company_name')


def get_sponsor_by_id(club_id: int, sponsor_id: int) -> Optional[Sponsor]:
    """Récupère un sponsor par ID et club."""
    return Sponsor.objects.filter(club_id=club_id, id=sponsor_id).first()


def get_packs_for_club(club_id: int, active_only: bool = True) -> QuerySet[SponsorshipPack]:
    """Récupère la liste des packs de sponsoring d'un club."""
    qs = SponsorshipPack.objects.filter(club_id=club_id)
    if active_only:
        qs = qs.filter(is_active=True)
    return qs.order_by('price')


def get_contracts_for_club(club_id: int, status: Optional[str] = None) -> QuerySet[SponsorshipContract]:
    """Récupère les contrats de sponsoring d'un club."""
    qs = SponsorshipContract.objects.filter(club_id=club_id).select_related('sponsor', 'pack')
    if status:
        qs = qs.filter(status=status)
    return qs.order_by('-start_date')


def get_contract_by_id(club_id: int, contract_id: int) -> Optional[SponsorshipContract]:
    """Récupère un contrat par ID et club."""
    return SponsorshipContract.objects.filter(club_id=club_id, id=contract_id).select_related('sponsor', 'pack').first()

