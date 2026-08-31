from typing import Optional
from django.db.models import QuerySet, Q
from apps.fleet.models import Vehicle, VehicleReservation, VehicleStatus, ReservationStatus


def get_all_vehicles(status: Optional[str] = None) -> QuerySet[Vehicle]:
    qs = Vehicle.objects.all()
    if status:
        qs = qs.filter(status=status)
    return qs


def get_vehicle_by_id(vehicle_id: int) -> Optional[Vehicle]:
    return Vehicle.objects.filter(id=vehicle_id).first()


def get_all_reservations(vehicle_id: Optional[int] = None) -> QuerySet[VehicleReservation]:
    qs = VehicleReservation.objects.all()
    if vehicle_id:
        qs = qs.filter(vehicle_id=vehicle_id)
    return qs


def check_vehicle_availability(vehicle_id: int, start_time, end_time) -> bool:
    overlapping = VehicleReservation.objects.filter(
        vehicle_id=vehicle_id,
        status__in=[ReservationStatus.APPROVED, ReservationStatus.PENDING]
    ).filter(
        Q(start_time__lt=end_time) & Q(end_time__gt=start_time)
    )
    return not overlapping.exists()
