from django.test import TestCase
from datetime import date
from decimal import Decimal
from apps.invoicing.services.invoice_service import create_invoice, add_invoice_item, mark_invoice_paid, create_quote, convert_quote_to_invoice


class InvoicingTestCase(TestCase):

    def test_invoice_tva_auto_calculation(self):
        """IFRS 15 — TVA calculée automatiquement lors de la création."""
        invoice = create_invoice(
            club_id=1, number='FAC-2026-001', client_name='AS Gesport',
            issue_date=date(2026, 1, 10), due_date=date(2026, 2, 10),
            amount_excl_tax=Decimal('1000.00'), tax_rate=Decimal('20.00'),
        )
        self.assertEqual(invoice.tax_amount, Decimal('200.00'))
        self.assertEqual(invoice.amount_incl_tax, Decimal('1200.00'))

    def test_invoice_mark_paid(self):
        invoice = create_invoice(
            club_id=1, number='FAC-2026-002', client_name='Club Rival',
            issue_date=date(2026, 1, 15), due_date=date(2026, 2, 15),
            amount_excl_tax=Decimal('500.00'),
        )
        self.assertEqual(invoice.status, 'draft')
        paid = mark_invoice_paid(invoice=invoice)
        self.assertEqual(paid.status, 'paid')

    def test_add_invoice_item(self):
        invoice = create_invoice(
            club_id=1, number='FAC-2026-003', client_name='Sponsor ABC',
            issue_date=date(2026, 2, 1), due_date=date(2026, 3, 1),
            amount_excl_tax=Decimal('300.00'),
        )
        item = add_invoice_item(invoice=invoice, description='Licence jeune', quantity=Decimal('3'), unit_price=Decimal('100.00'))
        self.assertEqual(item.total, Decimal('300.00'))

    def test_convert_quote_to_invoice(self):
        quote = create_quote(
            club_id=1, reference='DEVIS-2026-001', client_name='Mairie',
            issue_date=date(2026, 1, 1), validity_date=date(2026, 3, 1),
            amount_excl_tax=Decimal('2000.00'),
        )
        invoice = convert_quote_to_invoice(quote=quote, invoice_number='FAC-2026-010', due_date=date(2026, 4, 1))
        self.assertEqual(invoice.quote, quote)
        self.assertEqual(invoice.amount_excl_tax, Decimal('2000.00'))
