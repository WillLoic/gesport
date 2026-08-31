from django.db import models
from apps.governance.models.assembly import GeneralAssembly
from apps.vault.models import VaultDocument


class MinutesSignatureStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Brouillon'
    PENDING_SIGNATURE = 'PENDING_SIGNATURE', 'En attente de signature'
    SIGNED = 'SIGNED', 'Signé'


class AssemblyMinutes(models.Model):
    assembly = models.OneToOneField(
        GeneralAssembly,
        on_delete=models.CASCADE,
        related_name='minutes'
    )
    vault_document = models.ForeignKey(
        VaultDocument,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='governance_minutes'
    )
    content_summary = models.TextField(blank=True, default='')
    signed_pv_status = models.CharField(
        max_length=30,
        choices=MinutesSignatureStatus.choices,
        default=MinutesSignatureStatus.DRAFT
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"PV pour {self.assembly.title} - {self.signed_pv_status}"
