from django.test import TestCase
from datetime import date
from apps.inventory.models import StorageLocation, EquipmentItem
from apps.loans.models import EquipmentLoan, LoanStatus
from apps.loans.services.loan_service import create_loan, return_loan


class LoanTestCase(TestCase):

    def setUp(self):
        self.location = StorageLocation.objects.create(name="Local Matériel Gymnase")
        self.equipment = EquipmentItem.objects.create(
            name="Ballon de Football Nike",
            category="Ballons",
            quantity_in_stock=10,
            location=self.location,
        )

    def test_create_loan_decrements_stock(self):
        loan = create_loan(
            equipment=self.equipment,
            borrower_name="Coach Thomas",
            borrower_email="thomas@club.com",
            expected_return_date=date(2026, 9, 1),
            quantity_borrowed=3,
        )
        self.equipment.refresh_from_db()
        self.assertEqual(self.equipment.quantity_in_stock, 7)
        self.assertEqual(loan.status, LoanStatus.ACTIVE)
        self.assertEqual(loan.quantity_borrowed, 3)

    def test_create_loan_insufficient_stock_raises_error(self):
        with self.assertRaises(ValueError):
            create_loan(
                equipment=self.equipment,
                borrower_name="Coach Alex",
                borrower_email="alex@club.com",
                expected_return_date=date(2026, 9, 1),
                quantity_borrowed=15,
            )

    def test_return_loan_increments_stock(self):
        loan = create_loan(
            equipment=self.equipment,
            borrower_name="Coach Thomas",
            borrower_email="thomas@club.com",
            expected_return_date=date(2026, 9, 1),
            quantity_borrowed=4,
        )
        self.equipment.refresh_from_db()
        self.assertEqual(self.equipment.quantity_in_stock, 6)

        returned = return_loan(loan=loan, return_notes="Rendu propre")
        self.equipment.refresh_from_db()
        self.assertEqual(self.equipment.quantity_in_stock, 10)
        self.assertEqual(returned.status, LoanStatus.RETURNED)

