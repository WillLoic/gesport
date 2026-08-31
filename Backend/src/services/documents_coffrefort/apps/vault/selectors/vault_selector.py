from typing import Optional
from django.db.models import QuerySet
from apps.vault.models import VaultDocument, DocumentAccessLog


def get_all_documents(confidentiality_level: Optional[str] = None) -> QuerySet[VaultDocument]:
    qs = VaultDocument.objects.all()
    if confidentiality_level:
        qs = qs.filter(confidentiality_level=confidentiality_level)
    return qs


def get_document_by_id(document_id: int) -> Optional[VaultDocument]:
    return VaultDocument.objects.filter(id=document_id).first()


def get_document_access_logs(document_id: int) -> QuerySet[DocumentAccessLog]:
    return DocumentAccessLog.objects.filter(document_id=document_id)
