from decimal import Decimal
from django.db import models
from apps.fleet.models import Vehicle
from apps.inventory.models import EquipmentItem


class MaintenanceType(models.TextChoices):
    TECHNICAL_CONTROL = 'TECHNICAL_CONTROL', 'Contrôle Technique'
    REVISION = 'REVISION', 'Révision'
    REPAIR = 'REPAIR', 'Réparation'
    INSPECTION = 'INSPECTION', 'Inspection'


class MaintenanceStatus(models.TextChoices):
    SCHEDULED = 'SCHEDULED', 'Planifié'
    COMPLETED = 'COMPLETED', 'Terminé'
    CANCELLED = 'CANCELLED', 'Annulé'


class MaintenanceRecord(models.Model):
    vehicle = models.ForeignKey(
        Vehicle,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='maintenance_records'
    )
    equipment = models.ForeignKey(
        EquipmentItem,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='maintenance_records'
    )
    maintenance_type = models.CharField(
        max_length=30,
        choices=MaintenanceType.choices,
        default=MaintenanceType.REVISION
    )
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    performed_date = models.DateField()
    next_due_date = models.DateField(null=True, blank=True)
    provider = models.CharField(max_length=255, blank=True, default='')
    status = models.CharField(
        max_length=20,
        choices=MaintenanceStatus.choices,
        default=MaintenanceStatus.SCHEDULED
    )
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-performed_date']

    def __str__(self):
        target = self.vehicle.registration_number if self.vehicle else (self.equipment.name if self.equipment else "Autre")
        return f"Maintenance [{self.get_maintenance_type_display()}] — {target} ({self.get_status_display()})"

