from django.db import models
from apps.inventory.models import EquipmentItem


class LoanStatus(models.TextChoices):
    ACTIVE = 'ACTIVE', 'En cours'
    RETURNED = 'RETURNED', 'Restitué'
    OVERDUE = 'OVERDUE', 'En retard'


class EquipmentLoan(models.Model):
    equipment = models.ForeignKey(
        EquipmentItem,
        on_delete=models.CASCADE,
        related_name='loans'
    )
    borrower_name = models.CharField(max_length=255)
    borrower_email = models.EmailField()
    quantity_borrowed = models.PositiveIntegerField(default=1)
    loan_date = models.DateField(auto_now_add=True)
    expected_return_date = models.DateField()
    actual_return_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=LoanStatus.choices,
        default=LoanStatus.ACTIVE
    )
    initial_condition_notes = models.TextField(blank=True, default='Bon état')
    return_condition_notes = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-loan_date']

    def __str__(self):
        return f"Emprunt {self.equipment.name} x{self.quantity_borrowed} par {self.borrower_name} ({self.status})"
