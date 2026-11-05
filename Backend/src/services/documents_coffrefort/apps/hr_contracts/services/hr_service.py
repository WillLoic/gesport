from datetime import date
from typing import Optional, List
from apps.hr_contracts.models import (
    HRContract, ContractType, HRContractStatus,
    LeaveRequest, LeaveType, LeaveStatus,
    StaffReplacement, ClubStaffMember
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


def update_hr_contract(
    contract: HRContract,
    employee_name: Optional[str] = None,
    employee_email: Optional[str] = None,
    contract_type: Optional[str] = None,
    position_title: Optional[str] = None,
    salary_monthly: Optional[float] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    status: Optional[str] = None,
) -> HRContract:
    if employee_name is not None:
        contract.employee_name = employee_name
    if employee_email is not None:
        contract.employee_email = employee_email
    if contract_type is not None:
        contract.contract_type = contract_type
    if position_title is not None:
        contract.position_title = position_title
    if salary_monthly is not None:
        contract.salary_monthly = salary_monthly
    if start_date is not None:
        contract.start_date = start_date
    if end_date is not None:
        contract.end_date = end_date
    if status is not None:
        contract.status = status
    contract.save()
    return contract


def renew_hr_contract(
    contract: HRContract,
    new_end_date: date,
    salary_monthly: Optional[float] = None,
    contract_type: Optional[str] = None,
) -> HRContract:
    contract.end_date = new_end_date
    contract.status = HRContractStatus.ACTIVE
    if salary_monthly is not None:
        contract.salary_monthly = salary_monthly
    if contract_type is not None:
        contract.contract_type = contract_type
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


def update_leave_request(
    leave: LeaveRequest,
    employee_name: Optional[str] = None,
    employee_email: Optional[str] = None,
    leave_type: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    status: Optional[str] = None,
    reason: Optional[str] = None,
) -> LeaveRequest:
    if employee_name is not None:
        leave.employee_name = employee_name
    if employee_email is not None:
        leave.employee_email = employee_email
    if leave_type is not None:
        leave.leave_type = leave_type
    if start_date is not None:
        leave.start_date = start_date
    if end_date is not None:
        leave.end_date = end_date
    if status is not None:
        leave.status = status
    if reason is not None:
        leave.reason = reason
    leave.save()
    return leave


def complete_leave_request(leave: LeaveRequest) -> LeaveRequest:
    leave.status = LeaveStatus.COMPLETED
    leave.save()
    return leave


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


def create_club_staff_member(
    name: str,
    role: str,
    department: str,
    email: str,
    phone: str = '',
    contract_type: str = 'CDI',
    qualifications: Optional[List[str]] = None,
    assigned_teams: Optional[List[str]] = None,
    access_level: str = 'Coach'
) -> ClubStaffMember:
    return ClubStaffMember.objects.create(
        name=name,
        role=role,
        department=department,
        email=email,
        phone=phone,
        contract_type=contract_type,
        qualifications=qualifications or [],
        assigned_teams=assigned_teams or [],
        access_level=access_level,
    )


def update_club_staff_member(
    member: ClubStaffMember,
    name: Optional[str] = None,
    role: Optional[str] = None,
    department: Optional[str] = None,
    email: Optional[str] = None,
    phone: Optional[str] = None,
    contract_type: Optional[str] = None,
    qualifications: Optional[List[str]] = None,
    assigned_teams: Optional[List[str]] = None,
    access_level: Optional[str] = None,
) -> ClubStaffMember:
    if name is not None:
        member.name = name
    if role is not None:
        member.role = role
    if department is not None:
        member.department = department
    if email is not None:
        member.email = email
    if phone is not None:
        member.phone = phone
    if contract_type is not None:
        member.contract_type = contract_type
    if qualifications is not None:
        member.qualifications = qualifications
    if assigned_teams is not None:
        member.assigned_teams = assigned_teams
    if access_level is not None:
        member.access_level = access_level
    member.save()
    return member

