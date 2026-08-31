import uuid
from django.db import models
from apps.signatures.models.signature_request import SignatureRequest


class SignerRole(models.TextChoices):
    EMPLOYEE = 'EMPLOYEE', 'Employé'
    EMPLOYER = 'EMPLOYER', 'Employeur'
    AGENT = 'AGENT', 'Agent / Représentant'
    WITNESS = 'WITNESS', 'Témoin'


class SignerStatus(models.TextChoices):
    PENDING = 'PENDING', 'En attente'
    SIGNED = 'SIGNED', 'Signé'
    DECLINED = 'DECLINED', 'Refusé'


class Signer(models.Model):
    signature_request = models.ForeignKey(
        SignatureRequest,
        on_delete=models.CASCADE,
        related_name='signers'
    )
    name = models.CharField(max_length=255)
    email = models.EmailField()
    role = models.CharField(
        max_length=20,
        choices=SignerRole.choices,
        default=SignerRole.EMPLOYEE
    )
    status = models.CharField(
        max_length=20,
        choices=SignerStatus.choices,
        default=SignerStatus.PENDING
    )
    signed_at = models.DateTimeField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    otp_code = models.CharField(max_length=10, blank=True, default='')
    signature_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    rejection_reason = models.TextField(blank=True, default='')

    def __str__(self):
        return f"Signataire: {self.name} ({self.email}) - {self.status}"
