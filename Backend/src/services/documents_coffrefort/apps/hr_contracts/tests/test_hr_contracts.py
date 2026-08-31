from datetime import date
from django.test import TestCase
from apps.hr_contracts.models import ContractType, HRContractStatus, LeaveStatus
from apps.hr_contracts.services.hr_service import (
    create_hr_contract, terminate_hr_contract, create_leave_request,
    approve_or_reject_leave, assign_staff_replacement
)


class HRContractsTestCase(TestCase):
    def test_create_and_terminate_hr_contract(self):
        contract = create_hr_contract(
            employee_name="Jean Dupont",
            employee_email="j.dupont@gesport.com",
            position_title="Entraîneur Principal",
            contract_type=ContractType.CDI,
            salary_monthly=3500.00,
            start_date=date(2026, 1, 1)
        )
        self.assertEqual(contract.employee_name, "Jean Dupont")
        self.assertEqual(contract.status, HRContractStatus.DRAFT)

        terminated = terminate_hr_contract(contract, termination_date=date(2026, 6, 30))
        self.assertEqual(terminated.status, HRContractStatus.TERMINATED)
        self.assertEqual(terminated.end_date, date(2026, 6, 30))

    def test_leave_request_workflow(self):
        leave = create_leave_request(
            employee_name="Marie Curie",
            employee_email="m.curie@gesport.com",
            start_date=date(2026, 7, 1),
            end_date=date(2026, 7, 15),
            reason="Congés d'été"
        )
        self.assertEqual(leave.status, LeaveStatus.PENDING)

        approved = approve_or_reject_leave(leave, approve=True, manager_name="Directeur RH")
        self.assertEqual(approved.status, LeaveStatus.APPROVED)
        self.assertEqual(approved.approved_by, "Directeur RH")

    def test_staff_replacement_assignment(self):
        rep = assign_staff_replacement(
            absent_employee_name="Marie Curie",
            replacement_employee_name="Pierre Curie",
            start_date=date(2026, 7, 1),
            end_date=date(2026, 7, 15),
            notes="Remplacement temporaire"
        )
        self.assertEqual(rep.absent_employee_name, "Marie Curie")
        self.assertEqual(rep.replacement_employee_name, "Pierre Curie")
