from datetime import date
from django.test import TestCase
from apps.signatures.models import SignatureRequestStatus, SignerStatus
from apps.signatures.services.signature_service import (
    create_signature_request, sign_document, decline_signature
)
from apps.hr_contracts.services.hr_service import create_hr_contract


class SignaturesTestCase(TestCase):
    def test_signature_request_workflow_completion(self):
        contract = create_hr_contract(
            employee_name="Alice Martin",
            employee_email="a.martin@gesport.com",
            position_title="Analyste Data",
            start_date=date(2026, 2, 1)
        )

        signers = [
            {"name": "Alice Martin", "email": "a.martin@gesport.com", "role": "EMPLOYEE"},
            {"name": "Directeur RH", "email": "rh@gesport.com", "role": "EMPLOYER"}
        ]

        req = create_signature_request(
            title="Signature Contrat CDI - Alice Martin",
            signers_data=signers,
            hr_contract=contract,
            security_otp_enabled=True
        )

        self.assertEqual(req.status, SignatureRequestStatus.PENDING)
        self.assertEqual(req.signers.count(), 2)

        signer1 = req.signers.get(email="a.martin@gesport.com")
        signer2 = req.signers.get(email="rh@gesport.com")

        # Signer 1 signs
        sign_document(signer1, ip_address="10.0.0.1", otp_entered=signer1.otp_code)
        self.assertEqual(signer1.status, SignerStatus.SIGNED)
        req.refresh_from_db()
        self.assertEqual(req.status, SignatureRequestStatus.PENDING)

        # Signer 2 signs -> Request completes and HR contract becomes ACTIVE
        sign_document(signer2, ip_address="10.0.0.2", otp_entered=signer2.otp_code)
        self.assertEqual(signer2.status, SignerStatus.SIGNED)
        req.refresh_from_db()
        self.assertEqual(req.status, SignatureRequestStatus.COMPLETED)
        contract.refresh_from_db()
        self.assertEqual(contract.status, "ACTIVE")

    def test_signature_decline(self):
        signers = [{"name": "Bob Vance", "email": "b.vance@gesport.com"}]
        req = create_signature_request(
            title="Signature Avenant Bob Vance",
            signers_data=signers,
            security_otp_enabled=False
        )
        signer = req.signers.first()
        decline_signature(signer, reason="Refus des termes")
        self.assertEqual(signer.status, SignerStatus.DECLINED)
        req.refresh_from_db()
        self.assertEqual(req.status, SignatureRequestStatus.CANCELLED)
