from django.db import models
from apps.hr_contracts.models.leave_request import LeaveRequest


class StaffReplacement(models.Model):
    absent_employee_name = models.CharField(max_length=255)
    replacement_employee_name = models.CharField(max_length=255)
    leave_request = models.ForeignKey(
        LeaveRequest,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='replacements'
    )
    start_date = models.DateField()
    end_date = models.DateField()
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Remplacement: {self.replacement_employee_name} remplace {self.absent_employee_name}"
