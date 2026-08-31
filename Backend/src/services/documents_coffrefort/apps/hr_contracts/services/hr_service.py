from datetime import date
from typing import Optional
from apps.hr_contracts.models import (
    HRContract, ContractType, HRContractStatus,
    LeaveRequest, LeaveType, LeaveStatus,
    StaffReplacement
)
from apps.vault.models import VaultDocument


def create_hr_contract(
    employee_name: str,
    employee_email: str,
    start_date: date,
    position_title: str,
    contract_type: str = ContractType.CDI,
    salary_monthly: float = 0.00,
    end_date: Optional[date] = None,
    vault_document: Optional[VaultDocument] = None
) -> HRContract:
    status = HRContractStatus.PENDING_SIGNATURE if vault_document else HRContractStatus.DRAFT
    return HRContract.objects.create(
        employee_name=employee_name,
        employee_email=employee_email,
        contract_type=contract_type,
        position_title=position_title,
        salary_monthly=salary_monthly,
        start_date=start_date,
        end_date=end_date,
        status=status,
        vault_document=vault_document
    )


def terminate_hr_contract(contract: HRContract, termination_date: Optional[date] = None) -> HRContract:
    contract.status = HRContractStatus.TERMINATED
    if termination_date:
        contract.end_date = termination_date
    contract.save()
    return contract


def create_leave_request(
    employee_name: str,
    employee_email: str,
    start_date: date,
    end_date: date,
    leave_type: str = LeaveType.PAID,
    reason: str = ''
) -> LeaveRequest:
    return LeaveRequest.objects.create(
        employee_name=employee_name,
        employee_email=employee_email,
        start_date=start_date,
        end_date=end_date,
        leave_type=leave_type,
        reason=reason,
        status=LeaveStatus.PENDING
    )


def approve_or_reject_leave(leave_request: LeaveRequest, approve: bool, manager_name: str = 'Manager') -> LeaveRequest:
    leave_request.status = LeaveStatus.APPROVED if approve else LeaveStatus.REJECTED
    leave_request.approved_by = manager_name
    leave_request.save()
    return leave_request


def assign_staff_replacement(
    absent_employee_name: str,
    replacement_employee_name: str,
    start_date: date,
    end_date: date,
    leave_request: Optional[LeaveRequest] = None,
    notes: str = ''
) -> StaffReplacement:
    return StaffReplacement.objects.create(
        absent_employee_name=absent_employee_name,
        replacement_employee_name=replacement_employee_name,
        start_date=start_date,
        end_date=end_date,
        leave_request=leave_request,
        notes=notes
    )
