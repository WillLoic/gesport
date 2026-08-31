from decimal import Decimal
from django.db import models
from apps.procurement.models.supplier import Supplier


class PurchaseOrderStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Brouillon'
    SUBMITTED = 'SUBMITTED', 'Soumis'
    APPROVED = 'APPROVED', 'Approuvé'
    RECEIVED = 'RECEIVED', 'Reçu'
    CANCELLED = 'CANCELLED', 'Annulé'


class PurchaseOrder(models.Model):
    po_number = models.CharField(max_length=50, unique=True)
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.PROTECT,
        related_name='purchase_orders'
    )
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    status = models.CharField(
        max_length=20,
        choices=PurchaseOrderStatus.choices,
        default=PurchaseOrderStatus.DRAFT
    )
    order_date = models.DateField(auto_now_add=True)
    notes = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-order_date']

    def __str__(self):
        return f"{self.po_number} | {self.supplier.name} — {self.total_amount}€ [{self.get_status_display()}]"


class OrderItem(models.Model):
    purchase_order = models.ForeignKey(
        PurchaseOrder,
        on_delete=models.CASCADE,
        related_name='items'
    )
    description = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))

    def save(self, *args, **kwargs):
        self.total_price = (Decimal(self.quantity) * self.unit_price).quantize(Decimal('0.01'))
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.description} x{self.quantity} ({self.total_price}€)"

