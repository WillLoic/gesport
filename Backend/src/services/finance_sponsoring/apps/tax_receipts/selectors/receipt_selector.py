"""
Selectors (requêtes ORM) pour l'application tax_receipts.
"""

from typing import Optional
from django.db.models import QuerySet
from apps.tax_receipts.models.receipt import Donor, TaxReceipt


def get_donors_for_club(club_id: int) -> QuerySet[Donor]:
    """Récupère tous les donateurs d'un club."""
    return Donor.objects.filter(club_id=club_id).order_by('last_name', 'first_name')


def get_donor_by_id(club_id: int, donor_id: int) -> Optional[Donor]:
    """Récupère un donateur spécifique par son ID et club."""
    return Donor.objects.filter(club_id=club_id, id=donor_id).first()


def get_tax_receipts_for_club(club_id: int, status: Optional[str] = None) -> QuerySet[TaxReceipt]:
    """Récupère l'ensemble des reçus fiscaux d'un club avec filtre statut optionnel."""
    qs = TaxReceipt.objects.filter(club_id=club_id).select_related('donor')
    if status:
        qs = qs.filter(status=status)
    return qs.order_by('-issued_at')


def get_tax_receipt_by_id(club_id: int, receipt_id: int) -> Optional[TaxReceipt]:
    """Récupère un reçu fiscal spécifique par ID et club."""
    return TaxReceipt.objects.filter(club_id=club_id, id=receipt_id).select_related('donor').first()

