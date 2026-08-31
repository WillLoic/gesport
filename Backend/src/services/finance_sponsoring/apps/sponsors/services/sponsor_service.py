"""
Services (logique métier pure) pour l'application sponsors.
Création des partenaires, gestion des packs et signature des contrats.
"""

from datetime import date
from decimal import Decimal
from typing import Optional
from django.db import transaction
from apps.sponsors.models.sponsor import Sponsor, SponsorshipPack, SponsorshipContract


def create_sponsor(
    club_id: int,
    company_name: str,
    contact_name: str,
    contact_email: str,
    sponsor_type: str = 'corporate',
    siret: str = '',
    contact_phone: str = '',
    website: str = '',
    logo_url: str = '',
    status: str = 'prospect',
) -> Sponsor:
    """Création d'un nouveau sponsor."""
    sponsor = Sponsor.objects.create(
        club_id=club_id,
        company_name=company_name,
        sponsor_type=sponsor_type,
        siret=siret,
        contact_name=contact_name,
        contact_email=contact_email,
        contact_phone=contact_phone,
        website=website,
        logo_url=logo_url,
        status=status,
    )
    return sponsor


def create_sponsorship_pack(
    club_id: int,
    name: str,
    price: Decimal,
    description: str = '',
    benefits: str = '',
) -> SponsorshipPack:
    """Création d'un pack de sponsoring."""
    pack = SponsorshipPack.objects.create(
        club_id=club_id,
        name=name,
        price=price,
        description=description,
        benefits=benefits,
        is_active=True,
    )
    return pack


def generate_contract_number(club_id: int, year: Optional[int] = None) -> str:
    """Génère un numéro unique de contrat au format CTR-YYYY-XXXX."""
    if year is None:
        year = date.today().year
    count = SponsorshipContract.objects.filter(club_id=club_id, created_at__year=year).count() + 1
    return f"CTR-{year}-{count:04d}"


@transaction.atomic
def create_sponsorship_contract(
    club_id: int,
    sponsor: Sponsor,
    start_date: date,
    end_date: date,
    amount: Decimal,
    pack: Optional[SponsorshipPack] = None,
    notes: str = '',
) -> SponsorshipContract:
    """Création et initialisation d'un contrat de partenariat."""
    contract_number = generate_contract_number(club_id, start_date.year)
    
    contract = SponsorshipContract.objects.create(
        club_id=club_id,
        contract_number=contract_number,
        sponsor=sponsor,
        pack=pack,
        start_date=start_date,
        end_date=end_date,
        amount=amount,
        status='draft',
        notes=notes,
    )
    return contract


@transaction.atomic
def sign_sponsorship_contract(contract: SponsorshipContract) -> SponsorshipContract:
    """
    Signe et active un contrat.
    Passe également le statut du sponsor à 'active'.
    """
    contract.status = 'signed'
    contract.save()

    contract.sponsor.status = 'active'
    contract.sponsor.save()

    return contract


@transaction.atomic
def terminate_sponsorship_contract(contract: SponsorshipContract) -> SponsorshipContract:
    """Résilie un contrat de sponsoring."""
    contract.status = 'terminated'
    contract.save()
    return contract

