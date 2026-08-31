from typing import List, Optional
from django.utils import timezone
from apps.governance.models import (
    GeneralAssembly, AssemblyType, AssemblyStatus, AssemblyConvocation,
    Resolution, ResolutionStatus, AssemblyMinutes, MinutesSignatureStatus
)
from apps.vault.models import VaultDocument


def create_assembly(
    title: str,
    scheduled_at,
    assembly_type: str = AssemblyType.ORDINARY,
    location: str = 'Siège social'
) -> GeneralAssembly:
    return GeneralAssembly.objects.create(
        title=title,
        scheduled_at=scheduled_at,
        assembly_type=assembly_type,
        location=location,
        status=AssemblyStatus.CONVOKED
    )


def send_convocations(assembly: GeneralAssembly, recipient_emails: List[str]) -> List[AssemblyConvocation]:
    convocations = []
    for email in recipient_emails:
        conv = AssemblyConvocation.objects.create(
            assembly=assembly,
            recipient_email=email
        )
        convocations.append(conv)
    return convocations


def add_resolution(assembly: GeneralAssembly, title: str, description: str = '') -> Resolution:
    return Resolution.objects.create(
        assembly=assembly,
        title=title,
        description=description,
        status=ResolutionStatus.DRAFT
    )


def vote_on_resolution(resolution: Resolution, votes_for: int, votes_against: int, votes_abstain: int) -> Resolution:
    resolution.votes_for += votes_for
    resolution.votes_against += votes_against
    resolution.votes_abstain += votes_abstain

    if resolution.votes_for > resolution.votes_against:
        resolution.status = ResolutionStatus.PASSED
    else:
        resolution.status = ResolutionStatus.REJECTED

    resolution.save()
    return resolution


def finalize_assembly_minutes(
    assembly: GeneralAssembly,
    content_summary: str,
    vault_document: Optional[VaultDocument] = None
) -> AssemblyMinutes:
    minutes, created = AssemblyMinutes.objects.get_or_create(
        assembly=assembly,
        defaults={
            'content_summary': content_summary,
            'vault_document': vault_document,
            'signed_pv_status': MinutesSignatureStatus.PENDING_SIGNATURE if vault_document else MinutesSignatureStatus.DRAFT
        }
    )
    if not created:
        minutes.content_summary = content_summary
        if vault_document:
            minutes.vault_document = vault_document
            minutes.signed_pv_status = MinutesSignatureStatus.PENDING_SIGNATURE
        minutes.save()

    assembly.status = AssemblyStatus.COMPLETED
    assembly.save()

    return minutes
