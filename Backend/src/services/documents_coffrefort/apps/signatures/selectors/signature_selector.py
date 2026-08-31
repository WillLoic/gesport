from typing import Optional
from django.db.models import QuerySet
from apps.signatures.models import SignatureRequest, Signer


def get_all_signature_requests(status: Optional[str] = None) -> QuerySet[SignatureRequest]:
    qs = SignatureRequest.objects.all()
    if status:
        qs = qs.filter(status=status)
    return qs


def get_signature_request_by_id(request_id: int) -> Optional[SignatureRequest]:
    return SignatureRequest.objects.filter(id=request_id).first()


def get_signer_by_token(token: str) -> Optional[Signer]:
    try:
        return Signer.objects.filter(signature_token=token).first()
    except ValueError:
        return None
