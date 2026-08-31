from datetime import date
from decimal import Decimal
from typing import Optional
from django.db import transaction
from apps.maintenance.models import MaintenanceRecord, MaintenanceType, MaintenanceStatus
from apps.fleet.models import Vehicle, VehicleStatus
from apps.inventory.models import EquipmentItem


@transaction.atomic
def schedule_maintenance(
    performed_date: date,
    maintenance_type: str = MaintenanceType.REVISION,
    vehicle: Optional[Vehicle] = None,
    equipment: Optional[EquipmentItem] = None,
    cost: Decimal = Decimal('0.00'),
    next_due_date: Optional[date] = None,
    provider: str = '',
    notes: str = '',
) -> MaintenanceRecord:
    record = MaintenanceRecord.objects.create(
        vehicle=vehicle,
        equipment=equipment,
        maintenance_type=maintenance_type,
        cost=cost,
        performed_date=performed_date,
        next_due_date=next_due_date,
        provider=provider,
        status=MaintenanceStatus.SCHEDULED,
        notes=notes,
    )

    # If associated with a vehicle, put the vehicle in IN_MAINTENANCE status
    if vehicle and vehicle.status != VehicleStatus.IN_MAINTENANCE:
        vehicle.status = VehicleStatus.IN_MAINTENANCE
        vehicle.save()

    return record


@transaction.atomic
def complete_maintenance(record: MaintenanceRecord, final_cost: Optional[Decimal] = None) -> MaintenanceRecord:
    record.status = MaintenanceStatus.COMPLETED
    if final_cost is not None:
        record.cost = final_cost
    record.save()

    # Restore vehicle status to AVAILABLE if vehicle was IN_MAINTENANCE
    if record.vehicle and record.vehicle.status == VehicleStatus.IN_MAINTENANCE:
        record.vehicle.status = VehicleStatus.AVAILABLE
        record.vehicle.save()

    return record

