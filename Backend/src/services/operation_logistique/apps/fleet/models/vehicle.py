from django.db import models


class FuelType(models.TextChoices):
    DIESEL = 'DIESEL', 'Gazole / Diesel'
    GASOLINE = 'GASOLINE', 'Essence'
    ELECTRIC = 'ELECTRIC', 'Électrique'
    HYBRID = 'HYBRID', 'Hybride'


class VehicleStatus(models.TextChoices):
    AVAILABLE = 'AVAILABLE', 'Disponible'
    RESERVED = 'RESERVED', 'Réservé'
    IN_MAINTENANCE = 'IN_MAINTENANCE', 'En maintenance'
    OUT_OF_SERVICE = 'OUT_OF_SERVICE', 'Hors service'


class Vehicle(models.Model):
    registration_number = models.CharField(max_length=50, unique=True)
    brand_model = models.CharField(max_length=255)
    seating_capacity = models.PositiveIntegerField(default=9)
    fuel_type = models.CharField(
        max_length=20,
        choices=FuelType.choices,
        default=FuelType.DIESEL
    )
    current_mileage = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=20,
        choices=VehicleStatus.choices,
        default=VehicleStatus.AVAILABLE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.brand_model} ({self.registration_number}) - {self.status}"
