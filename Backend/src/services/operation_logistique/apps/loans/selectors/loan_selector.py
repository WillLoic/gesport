from typing import Optional
from django.db.models import QuerySet
from apps.loans.models import EquipmentLoan, LoanStatus


def get_all_loans(status: Optional[str] = None) -> QuerySet[EquipmentLoan]:
    qs = EquipmentLoan.objects.all()
    if status:
        qs = qs.filter(status=status)
    return qs


def get_loan_by_id(loan_id: int) -> Optional[EquipmentLoan]:
    return EquipmentLoan.objects.filter(id=loan_id).first()
