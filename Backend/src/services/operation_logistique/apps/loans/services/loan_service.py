from datetime import date
from typing import Optional
from django.utils import timezone
from apps.loans.models import EquipmentLoan, LoanStatus
from apps.inventory.models import EquipmentItem
from apps.inventory.services.inventory_service import update_stock_quantity


def create_loan(
    equipment: EquipmentItem,
    borrower_name: str,
    borrower_email: str,
    expected_return_date: date,
    quantity_borrowed: int = 1,
    initial_condition_notes: str = 'Bon état'
) -> EquipmentLoan:
    if equipment.quantity_in_stock < quantity_borrowed:
        raise ValueError(f"Stock insuffisant pour {equipment.name} (Disponible: {equipment.quantity_in_stock}).")

    # Decrement inventory stock
    update_stock_quantity(equipment, equipment.quantity_in_stock - quantity_borrowed)

    return EquipmentLoan.objects.create(
        equipment=equipment,
        borrower_name=borrower_name,
        borrower_email=borrower_email,
        expected_return_date=expected_return_date,
        quantity_borrowed=quantity_borrowed,
        initial_condition_notes=initial_condition_notes,
        status=LoanStatus.ACTIVE
    )


def return_loan(loan: EquipmentLoan, return_date: Optional[date] = None, return_notes: str = '') -> EquipmentLoan:
    if loan.status == LoanStatus.RETURNED:
        return loan

    loan.status = LoanStatus.RETURNED
    loan.actual_return_date = return_date or timezone.now().date()
    loan.return_condition_notes = return_notes
    loan.save()

    # Re-increment inventory stock
    equipment = loan.equipment
    update_stock_quantity(equipment, equipment.quantity_in_stock + loan.quantity_borrowed)

    return loan
