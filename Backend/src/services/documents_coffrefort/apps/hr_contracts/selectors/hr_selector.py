from typing import Optional
from django.db.models import QuerySet
from apps.hr_contracts.models import HRContract, LeaveRequest, StaffReplacement


def get_all_hr_contracts(status: Optional[str] = None) -> QuerySet[HRContract]:
    qs = HRContract.objects.all()
    if status:
        qs = qs.filter(status=status)
    return qs


def get_hr_contract_by_id(contract_id: int) -> Optional[HRContract]:
    return HRContract.objects.filter(id=contract_id).first()


def get_all_leave_requests(status: Optional[str] = None) -> QuerySet[LeaveRequest]:
    qs = LeaveRequest.objects.all()
    if status:
        qs = qs.filter(status=status)
    return qs


def get_leave_request_by_id(leave_id: int) -> Optional[LeaveRequest]:
    return LeaveRequest.objects.filter(id=leave_id).first()


def get_all_staff_replacements() -> QuerySet[StaffReplacement]:
    return StaffReplacement.objects.all()
