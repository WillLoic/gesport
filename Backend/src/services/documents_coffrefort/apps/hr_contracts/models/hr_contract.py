from django.db import models
from apps.vault.models import VaultDocument


class ContractType(models.TextChoices):
    CDI = 'CDI', 'CDI'
    CDD = 'CDD', 'CDD'
    PRESTATION = 'PRESTATION', 'Prestation de service'
    STAGE = 'STAGE', 'Stage'
    BENEVOLAT = 'BENEVOLAT', 'Bénévolat'


class HRContractStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Brouillon'
    PENDING_SIGNATURE = 'PENDING_SIGNATURE', 'En attente de signature'
    ACTIVE = 'ACTIVE', 'Actif'
    TERMINATED = 'TERMINATED', 'Résilier'
    EXPIRED = 'EXPIRED', 'Expiré'


class HRContract(models.Model):
    employee_name = models.CharField(max_length=255)
    employee_email = models.EmailField()
    contract_type = models.CharField(
        max_length=20,
        choices=ContractType.choices,
        default=ContractType.CDI
    )
    position_title = models.CharField(max_length=150)
    salary_monthly = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=30,
        choices=HRContractStatus.choices,
        default=HRContractStatus.DRAFT
    )
    vault_document = models.ForeignKey(
        VaultDocument,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='hr_contracts'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Contrat {self.contract_type} - {self.employee_name} ({self.status})"
