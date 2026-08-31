from django.db import models
from apps.fleet.models.vehicle import Vehicle


class ReservationStatus(models.TextChoices):
    PENDING = 'PENDING', 'En attente'
    APPROVED = 'APPROVED', 'Approuvée'
    CANCELLED = 'CANCELLED', 'Annulée'
    COMPLETED = 'COMPLETED', 'Terminée'


class VehicleReservation(models.Model):
    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.CASCADE,
        related_name='reservations'
    )
    driver_name = models.CharField(max_length=255)
    driver_email = models.EmailField()
    purpose = models.CharField(max_length=255, help_text="Motif du déplacement (ex: Match à l'extérieur U17)")
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(
        max_length=20,
        choices=ReservationStatus.choices,
        default=ReservationStatus.PENDING
    )
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['start_time']

    def __str__(self):
        return f"Réservation {self.vehicle.registration_number} par {self.driver_name} ({self.status})"
