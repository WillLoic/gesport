from django.test import TestCase
from datetime import date
from decimal import Decimal
from apps.tax_receipts.services.receipt_service import create_donor, issue_tax_receipt, cancel_tax_receipt


class TaxReceiptTestCase(TestCase):

    def setUp(self):
        self.donor = create_donor(
            club_id=1,
            donor_type='individual',
            first_name='Jean',
            last_name='Dupont',
            email='jean.dupont@example.com',
            address='12 Rue du Sport, 75001 Paris',
        )

    def test_create_donor(self):
        self.assertEqual(self.donor.first_name, 'Jean')
        self.assertEqual(self.donor.last_name, 'Dupont')
        self.assertEqual(self.donor.donor_type, 'individual')

    def test_issue_tax_receipt(self):
        receipt = issue_tax_receipt(
            club_id=1,
            donor=self.donor,
            donation_date=date(2026, 1, 15),
            amount=Decimal('500.00'),
            donation_type='money',
            description='Don pour le pôle jeune',
        )
        self.assertTrue(receipt.receipt_number.startswith('CERFA-2026-'))
        self.assertEqual(receipt.amount, Decimal('500.00'))
        self.assertEqual(receipt.status, 'issued')
        self.assertEqual(receipt.donor, self.donor)

    def test_cancel_tax_receipt(self):
        receipt = issue_tax_receipt(
            club_id=1,
            donor=self.donor,
            donation_date=date(2026, 2, 1),
            amount=Decimal('100.00'),
        )
        cancelled = cancel_tax_receipt(receipt=receipt)
        self.assertEqual(cancelled.status, 'cancelled')

