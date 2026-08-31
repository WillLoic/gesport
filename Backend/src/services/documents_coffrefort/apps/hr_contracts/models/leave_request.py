from django.db import models


class LeaveType(models.TextChoices):
    PAID = 'PAID', 'Congé payé'
    UNPAID = 'UNPAID', 'Congé sans solde'
    SICK = 'SICK', 'Arrêt maladie'
    MATERNITY = 'MATERNITY', 'Maternité / Paternité'


class LeaveStatus(models.TextChoices):
    PENDING = 'PENDING', 'En attente'
    APPROVED = 'APPROVED', 'Approuvé'
    REJECTED = 'REJECTED', 'Refusé'


class LeaveRequest(models.Model):
    employee_name = models.CharField(max_length=255)
    employee_email = models.EmailField()
    leave_type = models.CharField(
        max_length=20,
        choices=LeaveType.choices,
        default=LeaveType.PAID
    )
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=LeaveStatus.choices,
        default=LeaveStatus.PENDING
    )
    reason = models.TextField(blank=True, default='')
    approved_by = models.CharField(max_length=150, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Congé {self.leave_type} - {self.employee_name} ({self.status})"
