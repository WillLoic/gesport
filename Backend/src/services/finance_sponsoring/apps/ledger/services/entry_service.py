from decimal import Decimal
from django.db import transaction as db_transaction
from apps.ledger.models.entry import AccountPlan, FiscalYear, JournalEntry


def create_account(*, club_id: int, code: str, label: str, account_type: str, **kwargs) -> AccountPlan:
    return AccountPlan.objects.create(club_id=club_id, code=code, label=label, account_type=account_type, **kwargs)


def create_fiscal_year(*, club_id: int, label: str, start_date, end_date) -> FiscalYear:
    return FiscalYear.objects.create(club_id=club_id, label=label, start_date=start_date, end_date=end_date)


@db_transaction.atomic
def create_journal_entry(
    *,
    club_id: int,
    fiscal_year_id: int,
    account_id: int,
    journal: str,
    entry_date,
    reference: str,
    label: str,
    debit: Decimal = Decimal('0.00'),
    credit: Decimal = Decimal('0.00'),
    currency_code: str = 'EUR',
    exchange_rate: Decimal = Decimal('1.000000'),
) -> JournalEntry:
    """
    Crée une écriture comptable.
    Principe IFRS — chaque transaction doit respecter l'équilibre débit/crédit
    au niveau de l'opération globale (non vérifié ici, géré au niveau service appelant).
    """
    entry = JournalEntry.objects.create(
        club_id=club_id,
        fiscal_year_id=fiscal_year_id,
        account_id=account_id,
        journal=journal,
        entry_date=entry_date,
        reference=reference,
        label=label,
        debit=debit,
        credit=credit,
        currency_code=currency_code,
        exchange_rate=exchange_rate,
    )
    return entry


def validate_entry(*, entry: JournalEntry) -> JournalEntry:
    """Valide une écriture — elle devient non modifiable (IFRS immuabilité)."""
    entry.is_validated = True
    entry.save(update_fields=['is_validated'])
    return entry


def close_fiscal_year(*, fiscal_year: FiscalYear) -> FiscalYear:
    """Clôture l'exercice comptable."""
    fiscal_year.status = 'closed'
    fiscal_year.save(update_fields=['status'])
    return fiscal_year
