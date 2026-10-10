from datetime import datetime
from apps.fleet.models import Vehicle, VehicleReservation, FuelType, VehicleStatus, ReservationStatus
from apps.fleet.selectors.fleet_selector import check_vehicle_availability


def add_vehicle(
    registration_number: str,
    brand_model: str,
    seating_capacity: int = 9,
    fuel_type: str = FuelType.DIESEL,
    current_mileage: int = 0
) -> Vehicle:
    return Vehicle.objects.create(
        registration_number=registration_number,
        brand_model=brand_model,
        seating_capacity=seating_capacity,
        fuel_type=fuel_type,
        current_mileage=current_mileage,
        status=VehicleStatus.AVAILABLE
    )


def create_vehicle_reservation(
    vehicle: Vehicle,
    driver_name: str,
    driver_email: str,
    purpose: str,
    start_time: datetime,
    end_time: datetime,
    notes: str = ''
) -> VehicleReservation:
    if not check_vehicle_availability(vehicle.id, start_time, end_time):
        raise ValueError("Le véhicule est déjà réservé sur ce créneau horaire.")

    vehicle.status = VehicleStatus.RESERVED
    vehicle.save()

    return VehicleReservation.objects.create(
        vehicle=vehicle,
        driver_name=driver_name,
        driver_email=driver_email,
        purpose=purpose,
        start_time=start_time,
        end_time=end_time,
        notes=notes,
        status=ReservationStatus.APPROVED
    )


def complete_reservation(reservation: VehicleReservation, updated_mileage: int = None) -> VehicleReservation:
    reservation.status = ReservationStatus.COMPLETED
    reservation.save()

    vehicle = reservation.vehicle
    vehicle.status = VehicleStatus.AVAILABLE
    if updated_mileage and updated_mileage > vehicle.current_mileage:
        vehicle.current_mileage = updated_mileage
    vehicle.save()

    return reservation


def release_vehicle(vehicle: Vehicle) -> Vehicle:
    vehicle.status = VehicleStatus.AVAILABLE
    vehicle.save()

    VehicleReservation.objects.filter(
        vehicle=vehicle,
        status__in=[ReservationStatus.PENDING, ReservationStatus.APPROVED]
    ).update(status=ReservationStatus.COMPLETED)

    return vehicle

