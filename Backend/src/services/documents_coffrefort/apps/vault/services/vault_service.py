import hashlib
import time
from typing import Dict, Any
from apps.vault.models import VaultDocument, DocumentAccessLog, AccessType, ConfidentialityLevel


def upload_vault_document(
    title: str,
    file_path_or_s3_key: str,
    description: str = '',
    file_size: int = 0,
    mime_type: str = 'application/octet-stream',
    confidentiality_level: str = ConfidentialityLevel.CONFIDENTIAL,
    uploaded_by: str = 'system',
    is_encrypted: bool = True,
    encryption_algorithm: str = 'AES-256'
) -> VaultDocument:
    # Compute simulated or real hash
    raw_input = f"{title}:{file_path_or_s3_key}:{time.time()}"
    sha256_hash = hashlib.sha256(raw_input.encode('utf-8')).hexdigest()

    doc = VaultDocument.objects.create(
        title=title,
        description=description,
        file_path_or_s3_key=file_path_or_s3_key,
        file_size=file_size,
        mime_type=mime_type,
        sha256_hash=sha256_hash,
        confidentiality_level=confidentiality_level,
        is_encrypted=is_encrypted,
        encryption_algorithm=encryption_algorithm,
        uploaded_by=uploaded_by
    )
    return doc


def generate_presigned_url(
    document: VaultDocument,
    accessed_by: str = 'system',
    ip_address: str = None,
    expiration_seconds: int = 3600
) -> Dict[str, Any]:
    # Log access
    DocumentAccessLog.objects.create(
        document=document,
        accessed_by=accessed_by,
        access_type=AccessType.PRESIGNED_URL_GENERATED,
        ip_address=ip_address
    )

    presigned_url = f"https://s3.local.gesport/documents-coffrefort/{document.file_path_or_s3_key}?token=presigned_{document.id}_{int(time.time())}&expires={expiration_seconds}"

    return {
        'document_id': document.id,
        'title': document.title,
        'presigned_url': presigned_url,
        'expires_in_seconds': expiration_seconds,
        'sha256_hash': document.sha256_hash
    }
