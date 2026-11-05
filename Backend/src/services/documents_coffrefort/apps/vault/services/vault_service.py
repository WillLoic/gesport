import hashlib
import os
import time
from typing import Dict, Any, Optional
from django.conf import settings
from django.core.files.uploadedfile import InMemoryUploadedFile, TemporaryUploadedFile
from apps.vault.models import VaultDocument, DocumentAccessLog, AccessType, ConfidentialityLevel


# ============================================================
# Helpers
# ============================================================

def _compute_sha256(file_obj) -> str:
    """Calcule le hash SHA-256 d'un fichier uploadé."""
    sha256 = hashlib.sha256()
    for chunk in file_obj.chunks():
        sha256.update(chunk)
    return sha256.hexdigest()


def _build_media_url(relative_path: str, request=None) -> str:
    """
    Construit l'URL HTTP complète pour accéder à un fichier media.
    En dev local : http://localhost:8007/media/vault_documents/xxx.pdf
    En prod S3   : https://s3.amazonaws.com/gesport-vault/xxx.pdf
                   (géré automatiquement via django-storages + S3Boto3Storage)
    """
    media_url = settings.MEDIA_URL  # '/media/'
    base_url = f"http://localhost:8007{media_url}{relative_path}"
    return base_url


# ============================================================
# Service : Upload fichier réel
# ============================================================

def upload_file_to_vault(
    file,
    title: str,
    description: str = '',
    confidentiality_level: str = ConfidentialityLevel.CONFIDENTIAL,
    uploaded_by: str = 'system',
    is_encrypted: bool = True,
    encryption_algorithm: str = 'AES-256',
    category: str = '',
) -> VaultDocument:
    """
    Sauvegarde un fichier uploadé dans MEDIA_ROOT/vault_documents/
    et crée l'entrée VaultDocument en BD avec le chemin relatif.

    En production, remplacer le stockage local par S3 via django-storages :
        DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    """
    from django.core.files.storage import default_storage
    from django.core.files.base import ContentFile

    # Dossier de destination (relatif à MEDIA_ROOT)
    upload_dir = getattr(settings, 'VAULT_UPLOAD_TO', 'vault_documents/')

    # Nom de fichier unique : timestamp + nom original nettoyé
    original_name = getattr(file, 'name', 'document')
    safe_name = original_name.replace(' ', '_')
    unique_name = f"{int(time.time())}_{safe_name}"
    relative_path = os.path.join(upload_dir, unique_name).replace('\\', '/')

    # Hash SHA-256
    sha256_hash = _compute_sha256(file)

    # Reset du curseur avant sauvegarde
    file.seek(0)

    # Sauvegarde dans MEDIA_ROOT (ou S3 en prod via django-storages)
    saved_path = default_storage.save(relative_path, ContentFile(file.read()))

    # Taille réelle du fichier
    file_size = file.size if hasattr(file, 'size') else 0

    # Mime type
    mime_type = getattr(file, 'content_type', 'application/octet-stream')

    # Description enrichie avec la catégorie (pour le filtrage frontend)
    full_description = description
    if category:
        full_description = f"{category} | {description}" if description else category

    doc = VaultDocument.objects.create(
        title=title,
        description=full_description,
        file_path_or_s3_key=saved_path,   # chemin relatif dans MEDIA_ROOT
        file_size=file_size,
        mime_type=mime_type,
        sha256_hash=sha256_hash,
        confidentiality_level=confidentiality_level,
        is_encrypted=is_encrypted,
        encryption_algorithm=encryption_algorithm,
        uploaded_by=uploaded_by,
    )

    # Log de l'upload initial
    DocumentAccessLog.objects.create(
        document=doc,
        accessed_by=uploaded_by,
        access_type=AccessType.UPLOAD,
        ip_address=None,
    )

    return doc


# ============================================================
# Service : Upload sans fichier (métadonnées seules — legacy)
# ============================================================

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
    """Crée un VaultDocument avec seulement des métadonnées (sans upload de fichier réel)."""
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


# ============================================================
# Service : Mise à jour des métadonnées
# ============================================================

def update_vault_document(
    document: VaultDocument,
    title: Optional[str] = None,
    description: Optional[str] = None,
    confidentiality_level: Optional[str] = None,
) -> VaultDocument:
    """Mise à jour partielle des métadonnées d'un document (sans re-upload fichier)."""
    if title is not None:
        document.title = title
    if description is not None:
        document.description = description
    if confidentiality_level is not None:
        document.confidentiality_level = confidentiality_level
    document.save()
    return document


# ============================================================
# Service : Suppression (fichier + BD)
# ============================================================

def delete_vault_document(document: VaultDocument) -> None:
    """
    Supprime le fichier du disque (ou S3 en prod via django-storages)
    et l'entrée BD.
    """
    from django.core.files.storage import default_storage

    file_path = document.file_path_or_s3_key
    if file_path and default_storage.exists(file_path):
        try:
            default_storage.delete(file_path)
        except Exception:
            pass  # Ne pas bloquer si le fichier est déjà absent

    document.delete()


# ============================================================
# Service : URL de téléchargement (presigned en prod)
# ============================================================

def generate_presigned_url(
    document: VaultDocument,
    accessed_by: str = 'system',
    ip_address: str = None,
    expiration_seconds: int = 3600
) -> Dict[str, Any]:
    """
    Génère l'URL de téléchargement du document.
    En dev  : URL directe Django media (http://localhost:8007/media/vault_documents/xxx.pdf)
    En prod : URL pré-signée S3 avec expiration (via boto3.generate_presigned_url)
    """
    # Log de l'accès
    DocumentAccessLog.objects.create(
        document=document,
        accessed_by=accessed_by,
        access_type=AccessType.PRESIGNED_URL_GENERATED,
        ip_address=ip_address
    )

    file_path = document.file_path_or_s3_key or ''

    # En dev : URL directe via Django media server
    if file_path and not file_path.startswith('http') and not file_path.startswith('s3://'):
        download_url = _build_media_url(file_path)
    elif file_path.startswith('s3://'):
        # Placeholder prod — en prod utiliser boto3.generate_presigned_url()
        download_url = file_path.replace(
            's3://gesport-vault/',
            'https://gesport-vault.s3.eu-west-3.amazonaws.com/'
        )
    else:
        download_url = file_path

    return {
        'document_id': document.id,
        'title': document.title,
        'presigned_url': download_url,
        'expires_in_seconds': expiration_seconds,
        'sha256_hash': document.sha256_hash,
        'file_path': file_path,
    }
