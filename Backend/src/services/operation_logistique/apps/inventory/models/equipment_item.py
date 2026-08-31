from django.db import models
from apps.inventory.models.storage_location import StorageLocation


class EquipmentCategory(models.TextChoices):
    BALLS = 'BALLS', 'Balles & Ballons'
    NETS = 'NETS', 'Filets & Poteaux'
    APPARATUS = 'APPARATUS', 'Agrès & Tapis'
    UNIFORMS = 'UNIFORMS', 'Maillots & Tenues'
    PROTECTIVE = 'PROTECTIVE', 'Protections & Casques'
    OTHER = 'OTHER', 'Autre matériel'


class EquipmentStatus(models.TextChoices):
    AVAILABLE = 'AVAILABLE', 'Disponible'
    LOW_STOCK = 'LOW_STOCK', 'Stock Faible'
    OUT_OF_STOCK = 'OUT_OF_STOCK', 'Rupture de stock'
    DAMAGED = 'DAMAGED', 'Endommagé'


class EquipmentItem(models.Model):
    name = models.CharField(max_length=255)
    category = models.CharField(
        max_length=30,
        choices=EquipmentCategory.choices,
        default=EquipmentCategory.OTHER
    )
    quantity_in_stock = models.PositiveIntegerField(default=0)
    min_stock_threshold = models.PositiveIntegerField(default=5)
    status = models.CharField(
        max_length=20,
        choices=EquipmentStatus.choices,
        default=EquipmentStatus.AVAILABLE
    )
    location = models.ForeignKey(
        StorageLocation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='equipments'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} (Stock: {self.quantity_in_stock})"
