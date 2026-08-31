from django.test import TestCase
from datetime import date
from decimal import Decimal
from apps.banking.services.transaction_service import create_bank_account, import_transaction, reconcile_transaction


class BankingTestCase(TestCase):

    def test_import_credit_updates_balance(self):
        account = create_bank_account(club_id=1, name='Compte Principal', bank_name='BNP Paribas', iban='FR761234')
        self.assertEqual(account.current_balance, Decimal('0.00'))
        txn = import_transaction(
            account=account,
            transaction_date=date(2026, 1, 15),
            value_date=date(2026, 1, 15),
            label='Virement sponsor NIKE',
            amount=Decimal('10000.00'),
            direction='credit',
            category='operating',
        )
        account.refresh_from_db()
        self.assertEqual(account.current_balance, Decimal('10000.00'))
        self.assertEqual(txn.status, 'pending')

    def test_debit_decreases_balance(self):
        account = create_bank_account(club_id=1, name='Compte Secondaire', bank_name='Société Générale')
        account.current_balance = Decimal('5000.00')
        account.save()
        import_transaction(
            account=account, transaction_date=date(2026, 2, 1), value_date=date(2026, 2, 1),
            label='Paiement arbitres', amount=Decimal('300.00'), direction='debit', category='operating',
        )
        account.refresh_from_db()
        self.assertEqual(account.current_balance, Decimal('4700.00'))

    def test_reconcile_transaction(self):
        account = create_bank_account(club_id=1, name='Compte Test', bank_name='LCL')
        txn = import_transaction(
            account=account, transaction_date=date(2026, 3, 1), value_date=date(2026, 3, 1),
            label='Adhésion Club', amount=Decimal('200.00'), direction='credit', category='operating',
        )
        reconciled = reconcile_transaction(transaction=txn, journal_entry_id=42)
        self.assertEqual(reconciled.status, 'reconciled')
        self.assertEqual(reconciled.journal_entry_id, 42)
