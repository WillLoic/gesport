from datetime import timedelta
from django.test import TestCase
from django.utils import timezone
from apps.fleet.models import FuelType, VehicleStatus, ReservationStatus
from apps.fleet.services.fleet_service import add_vehicle, create_vehicle_reservation, complete_reservation


class FleetTestCase(TestCase):
    def setUp(self):
        self.vehicle = add_vehicle(
            registration_number="AB-123-CD",
            brand_model="Renault Master 9 places",
            seating_capacity=9,
            fuel_type=FuelType.DIESEL,
            current_mileage=45000
        )

    def test_vehicle_creation(self):
        self.assertEqual(self.vehicle.registration_number, "AB-123-CD")
        self.assertEqual(self.vehicle.status, VehicleStatus.AVAILABLE)

    def test_reservation_creation_and_completion(self):
        now = timezone.now()
        start = now + timedelta(days=1)
        end = start + timedelta(hours=5)

        res = create_vehicle_reservation(
            vehicle=self.vehicle,
            driver_name="Coach Thomas",
            driver_email="thomas@gesport.com",
            purpose="Déplacement Tournoi",
            start_time=start,
            end_time=end
        )
        self.assertEqual(res.status, ReservationStatus.APPROVED)

        # Complete reservation and update mileage
        completed = complete_reservation(res, updated_mileage=45350)
        self.assertEqual(completed.status, ReservationStatus.COMPLETED)
        self.vehicle.refresh_from_db()
        self.assertEqual(self.vehicle.current_mileage, 45350)

    def test_reservation_overlap_rejection(self):
        now = timezone.now()
        start = now + timedelta(days=2)
        end = start + timedelta(hours=4)

        create_vehicle_reservation(
            vehicle=self.vehicle,
            driver_name="Driver 1",
            driver_email="d1@gesport.com",
            purpose="Match",
            start_time=start,
            end_time=end
        )

        with self.assertRaises(ValueError):
            create_vehicle_reservation(
                vehicle=self.vehicle,
                driver_name="Driver 2",
                driver_email="d2@gesport.com",
                purpose="Autre match",
                start_time=start + timedelta(hours=1),
                end_time=end + timedelta(hours=1)
            )
