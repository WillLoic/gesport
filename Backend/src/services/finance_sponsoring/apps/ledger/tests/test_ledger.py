from django.test import TestCase
from datetime import date
from decimal import Decimal
from apps.ledger.services.entry_service import create_account, create_fiscal_year, create_journal_entry, validate_entry
from apps.ledger.selectors.entry_selector import get_account_balance


class LedgerTestCase(TestCase):

    def setUp(self):
        self.fy = create_fiscal_year(club_id=1, label="Exercice 2025-2026", start_date=date(2025, 9, 1), end_date=date(2026, 8, 31))
        self.account_debit = create_account(club_id=1, code='4120', label='Clients - Adhérents', account_type='asset')
        self.account_credit = create_account(club_id=1, code='7060', label='Cotisations et droits d\'entrée', account_type='revenue')

    def test_create_entry_debit(self):
        entry = create_journal_entry(
            club_id=1,
            fiscal_year_id=self.fy.id,
            account_id=self.account_debit.id,
            journal='VTE',
            entry_date=date(2025, 10, 1),
            reference='FAC-001',
            label='Cotisation annuelle - Dupont Jean',
            debit=Decimal('150.00'),
            credit=Decimal('0.00'),
        )
        self.assertEqual(entry.debit, Decimal('150.00'))
        self.assertEqual(entry.currency_code, 'EUR')
        self.assertFalse(entry.is_validated)

    def test_validate_entry(self):
        entry = create_journal_entry(
            club_id=1, fiscal_year_id=self.fy.id, account_id=self.account_credit.id,
            journal='VTE', entry_date=date(2025, 10, 1), reference='FAC-001',
            label='Cotisation', credit=Decimal('150.00'),
        )
        validated = validate_entry(entry=entry)
        self.assertTrue(validated.is_validated)

    def test_account_balance(self):
        create_journal_entry(
            club_id=1, fiscal_year_id=self.fy.id, account_id=self.account_debit.id,
            journal='BNQ', entry_date=date(2025, 10, 1), reference='VIR-001',
            label='Virement sponsor', debit=Decimal('5000.00'),
        )
        balance = get_account_balance(1, self.account_debit.id)
        self.assertEqual(balance['debit'], Decimal('5000.00'))
        self.assertEqual(balance['balance'], Decimal('5000.00'))

    def test_multi_currency_entry(self):
        """Test IFRS 9 / IAS 21 — écriture en USD avec taux de change."""
        entry = create_journal_entry(
            club_id=1, fiscal_year_id=self.fy.id, account_id=self.account_debit.id,
            journal='VTE', entry_date=date(2025, 11, 1), reference='INV-USD-001',
            label='Sponsor international - USD', debit=Decimal('1000.00'),
            currency_code='USD', exchange_rate=Decimal('0.920000'),
        )
        self.assertEqual(entry.currency_code, 'USD')
        self.assertEqual(entry.exchange_rate, Decimal('0.920000'))
