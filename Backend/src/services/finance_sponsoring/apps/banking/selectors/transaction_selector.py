from django.db.models import QuerySet
from apps.banking.models.transaction import BankAccount, BankTransaction


def list_bank_accounts(club_id: int) -> QuerySet:
    return BankAccount.objects.filter(club_id=club_id, is_active=True)


def list_transactions(account_id: int, *, status: str = None) -> QuerySet:
    qs = BankTransaction.objects.filter(account_id=account_id)
    if status:
        qs = qs.filter(status=status)
    return qs.order_by('-transaction_date')
