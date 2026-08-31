from django.db import models
from apps.vault.models import VaultDocument
from apps.hr_contracts.models import HRContract


class SignatureRequestStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Brouillon'
    PENDING = 'PENDING', 'En cours'
    COMPLETED = 'COMPLETED', 'Signé par tous'
    CANCELLED = 'CANCELLED', 'Annulé'
    EXPIRED = 'EXPIRED', 'Expiré'


class SignatureRequest(models.Model):
    title = models.CharField(max_length=255)
    vault_document = models.ForeignKey(
        VaultDocument,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='signature_requests'
    )
    hr_contract = models.ForeignKey(
        HRContract,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='signature_requests'
    )
    status = models.CharField(
        max_length=20,
        choices=SignatureRequestStatus.choices,
        default=SignatureRequestStatus.DRAFT
    )
    security_otp_enabled = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Demande signature: {self.title} ({self.status})"
