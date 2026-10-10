from django.db import models

class PurchaseOrderCategory(models.TextChoices):
    SPORTS_EQUIPMENT = 'Matériel Sportif', 'Matériel Sportif'
    CLOTHING = 'Textile & Flocage', 'Textile & Flocage'
    MEDICAL = 'Médical', 'Médical'
    FOOD = 'Alimentaire Buvette', 'Alimentaire Buvette'
    TRANSPORT = 'Frais Transport', 'Frais Transport'
    OTHER = 'Autre', 'Autre'

class PurchaseOrderStatus(models.TextChoices):
    PENDING = 'En attente validation', 'En attente validation'
    APPROVED = 'Validé', 'Validé'
    ORDERED = 'Commandé', 'Commandé'
    DELIVERED = 'Livré', 'Livré'
    REJECTED = 'Refusé', 'Refusé'

class PurchaseOrder(models.Model):
    code = models.CharField(max_length=50, unique=True)
    supplier_name = models.CharField(max_length=255)
    category = models.CharField(
        max_length=50,
        choices=PurchaseOrderCategory.choices,
        default=PurchaseOrderCategory.SPORTS_EQUIPMENT
    )
    description = models.TextField()
    requested_by = models.CharField(max_length=255)
    request_date = models.DateField(auto_now_add=True)
    total_amount_ttc = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(
        max_length=50,
        choices=PurchaseOrderStatus.choices,
        default=PurchaseOrderStatus.PENDING
    )
    invoice_attached = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.code} - {self.supplier_name}"
