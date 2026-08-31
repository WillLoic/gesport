from typing import Optional
from django.db.models import QuerySet
from apps.maintenance.models import MaintenanceRecord


def get_all_maintenance_records(status: Optional[str] = None) -> QuerySet[MaintenanceRecord]:
    qs = MaintenanceRecord.objects.select_related('vehicle', 'equipment').all()
    if status:
        qs = qs.filter(status=status)
    return qs


def get_maintenance_record_by_id(record_id: int) -> Optional[MaintenanceRecord]:
    return MaintenanceRecord.objects.select_related('vehicle', 'equipment').filter(id=record_id).first()

