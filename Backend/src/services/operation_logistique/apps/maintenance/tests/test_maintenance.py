from django.test import TestCase
from datetime import date
from decimal import Decimal
from apps.fleet.models import Vehicle, VehicleStatus
from apps.maintenance.models import MaintenanceRecord, MaintenanceStatus, MaintenanceType
from apps.maintenance.services.maintenance_service import schedule_maintenance, complete_maintenance


class MaintenanceTestCase(TestCase):

    def setUp(self):
        self.vehicle = Vehicle.objects.create(
            registration_number="AB-123-CD",
            brand_model="Renault Master Minibus",
            seating_capacity=9,
            current_mileage=50000,
            status=VehicleStatus.AVAILABLE,
        )

    def test_schedule_maintenance_changes_vehicle_status(self):
        record = schedule_maintenance(
            performed_date=date(2026, 9, 1),
            maintenance_type=MaintenanceType.TECHNICAL_CONTROL,
            vehicle=self.vehicle,
            cost=Decimal('150.00'),
            provider="Garage Central",
        )
        self.vehicle.refresh_from_db()
        self.assertEqual(self.vehicle.status, VehicleStatus.IN_MAINTENANCE)
        self.assertEqual(record.status, MaintenanceStatus.SCHEDULED)

    def test_complete_maintenance_restores_vehicle_status(self):
        record = schedule_maintenance(
            performed_date=date(2026, 9, 1),
            maintenance_type=MaintenanceType.REVISION,
            vehicle=self.vehicle,
            cost=Decimal('200.00'),
        )
        self.assertEqual(self.vehicle.status, VehicleStatus.IN_MAINTENANCE)

        completed = complete_maintenance(record=record, final_cost=Decimal('220.00'))
        self.vehicle.refresh_from_db()
        self.assertEqual(self.vehicle.status, VehicleStatus.AVAILABLE)
        self.assertEqual(completed.status, MaintenanceStatus.COMPLETED)
        self.assertEqual(completed.cost, Decimal('220.00'))

