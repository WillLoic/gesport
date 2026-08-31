"""
Services (logique métier pure) pour l'application tax_receipts.
Génération des numéros Cerfa, émission et annulation des reçus fiscaux.
"""

from datetime import date
from decimal import Decimal
from typing import Optional
from django.db import transaction
from apps.tax_receipts.models.receipt import Donor, TaxReceipt


def create_donor(
    club_id: int,
    last_name: str,
    email: str,
    donor_type: str = 'individual',
    first_name: str = '',
    address: str = '',
    tax_id: str = '',
) -> Donor:
    """Création d'un nouveau donateur."""
    donor = Donor.objects.create(
        club_id=club_id,
        donor_type=donor_type,
        first_name=first_name,
        last_name=last_name,
        email=email,
        address=address,
        tax_id=tax_id,
    )
    return donor


def generate_receipt_number(club_id: int, year: Optional[int] = None) -> str:
    """Génère un numéro unique de reçu fiscal au format CERFA-YYYY-XXXX."""
    if year is None:
        year = date.today().year
    count = TaxReceipt.objects.filter(club_id=club_id, issued_at__year=year).count() + 1
    return f"CERFA-{year}-{count:04d}"


@transaction.atomic
def issue_tax_receipt(
    club_id: int,
    donor: Donor,
    donation_date: date,
    amount: Decimal,
    donation_type: str = 'money',
    description: str = '',
) -> TaxReceipt:
    """
    Émet un reçu fiscal officiel (Cerfa 2041-RD / 11580*03).
    """
    receipt_number = generate_receipt_number(club_id, donation_date.year)
    
    receipt = TaxReceipt.objects.create(
        club_id=club_id,
        receipt_number=receipt_number,
        donor=donor,
        donation_date=donation_date,
        donation_type=donation_type,
        amount=amount,
        description=description,
        status='issued',
    )
    return receipt


@transaction.atomic
def cancel_tax_receipt(receipt: TaxReceipt) -> TaxReceipt:
    """Annule un reçu fiscal existant."""
    receipt.status = 'cancelled'
    receipt.save()
    return receipt

