from decimal import Decimal
from apps.banking.models.transaction import BankAccount, BankTransaction


def create_bank_account(*, club_id: int, name: str, bank_name: str, **kwargs) -> BankAccount:
    return BankAccount.objects.create(club_id=club_id, name=name, bank_name=bank_name, **kwargs)


def import_transaction(*, account: BankAccount, transaction_date, value_date, label: str, amount: Decimal, direction: str, **kwargs) -> BankTransaction:
    """Importe un mouvement depuis le relevé bancaire."""
    txn = BankTransaction.objects.create(
        account=account,
        transaction_date=transaction_date,
        value_date=value_date,
        label=label,
        amount=amount,
        direction=direction,
        **kwargs
    )
    # Mise à jour du solde
    if direction == 'credit':
        account.current_balance += amount
    else:
        account.current_balance -= amount
    account.save(update_fields=['current_balance'])
    return txn


def reconcile_transaction(*, transaction: BankTransaction, journal_entry_id: int) -> BankTransaction:
    """Rapproche un mouvement avec une écriture comptable du grand livre."""
    transaction.status = 'reconciled'
    transaction.journal_entry_id = journal_entry_id
    transaction.save(update_fields=['status', 'journal_entry_id'])
    return transaction
