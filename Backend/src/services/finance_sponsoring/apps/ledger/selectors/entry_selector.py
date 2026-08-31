from django.db.models import QuerySet, Sum
from decimal import Decimal
from apps.ledger.models.entry import AccountPlan, FiscalYear, JournalEntry


def list_accounts(club_id: int) -> QuerySet:
    return AccountPlan.objects.filter(club_id=club_id, is_active=True).order_by('code')


def list_fiscal_years(club_id: int) -> QuerySet:
    return FiscalYear.objects.filter(club_id=club_id).order_by('-start_date')


def list_journal_entries(club_id: int, *, fiscal_year_id: int = None, journal: str = None) -> QuerySet:
    qs = JournalEntry.objects.filter(club_id=club_id).select_related('account', 'fiscal_year')
    if fiscal_year_id:
        qs = qs.filter(fiscal_year_id=fiscal_year_id)
    if journal:
        qs = qs.filter(journal=journal)
    return qs.order_by('-entry_date')


def get_account_balance(club_id: int, account_id: int) -> dict:
    """Calcule le solde d'un compte : Débits - Crédits (partie double IFRS)."""
    result = JournalEntry.objects.filter(
        club_id=club_id, account_id=account_id
    ).aggregate(
        total_debit=Sum('debit'),
        total_credit=Sum('credit'),
    )
    debit = result['total_debit'] or Decimal('0.00')
    credit = result['total_credit'] or Decimal('0.00')
    return {'debit': debit, 'credit': credit, 'balance': debit - credit}
