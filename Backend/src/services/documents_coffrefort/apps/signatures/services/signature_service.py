import random
from typing import List, Dict, Any, Optional
from django.utils import timezone
from apps.signatures.models import (
    SignatureRequest, SignatureRequestStatus,
    Signer, SignerRole, SignerStatus
)
from apps.vault.models import VaultDocument
from apps.hr_contracts.models import HRContract, HRContractStatus


def create_signature_request(
    title: str,
    signers_data: List[Dict[str, str]],
    vault_document: Optional[VaultDocument] = None,
    hr_contract: Optional[HRContract] = None,
    security_otp_enabled: bool = True
) -> SignatureRequest:
    req = SignatureRequest.objects.create(
        title=title,
        vault_document=vault_document,
        hr_contract=hr_contract,
        security_otp_enabled=security_otp_enabled,
        status=SignatureRequestStatus.PENDING
    )

    for s_data in signers_data:
        otp = str(random.randint(100000, 999999)) if security_otp_enabled else ''
        Signer.objects.create(
            signature_request=req,
            name=s_data['name'],
            email=s_data['email'],
            role=s_data.get('role', SignerRole.EMPLOYEE),
            otp_code=otp,
            status=SignerStatus.PENDING
        )

    return req


def sign_document(
    signer: Signer,
    ip_address: Optional[str] = None,
    otp_entered: Optional[str] = None
) -> Signer:
    if signer.signature_request.security_otp_enabled:
        if otp_entered and otp_entered != signer.otp_code:
            raise ValueError("Code OTP incorrect.")

    signer.status = SignerStatus.SIGNED
    signer.signed_at = timezone.now()
    signer.ip_address = ip_address
    signer.save()

    sig_request = signer.signature_request
    pending_signers = sig_request.signers.filter(status=SignerStatus.PENDING).count()
    if pending_signers == 0:
        sig_request.status = SignatureRequestStatus.COMPLETED
        sig_request.save()

        if sig_request.hr_contract:
            sig_request.hr_contract.status = HRContractStatus.ACTIVE
            sig_request.hr_contract.save()

    return signer


def decline_signature(signer: Signer, reason: str = '') -> Signer:
    signer.status = SignerStatus.DECLINED
    signer.rejection_reason = reason
    signer.save()

    sig_request = signer.signature_request
    sig_request.status = SignatureRequestStatus.CANCELLED
    sig_request.save()

    return signer
