"""Tests unitaires pour l'application ticketing."""

from django.test import TestCase
from django.utils import timezone
from apps.ticketing.models import TicketEvent, TicketCategory, Ticket
from apps.ticketing.services.ticketing_service import purchase_ticket, validate_ticket_scan


class TicketingTestCase(TestCase):
    def setUp(self):
        self.event = TicketEvent.objects.create(
            club_id=1,
            title="Match Gala Finale",
            event_type=TicketEvent.EventType.MATCH,
            location="Stade Municipal",
            start_date=timezone.now() + timezone.timedelta(days=7),
            status=TicketEvent.Status.OPEN
        )
        self.category = TicketCategory.objects.create(
            event=self.event,
            name="Tribune Tribune VIP",
            price=15000,
            currency="XAF",
            total_capacity=50
        )

    def test_purchase_ticket_success(self):
        ticket = purchase_ticket(
            event_id=self.event.id,
            category_id=self.category.id,
            buyer_name="Jean Dupont",
            buyer_email="jean.dupont@email.com",
            buyer_phone="+237600000000"
        )
        self.assertEqual(ticket.buyer_name, "Jean Dupont")
        self.assertEqual(ticket.status, Ticket.Status.VALID)
        self.assertTrue(ticket.qr_code_data)
        
        self.category.refresh_from_db()
        self.assertEqual(self.category.sold_count, 1)

    def test_validate_ticket_scan_flow(self):
        ticket = purchase_ticket(
            event_id=self.event.id,
            category_id=self.category.id,
            buyer_name="Alice Smith",
            buyer_email="alice@email.com"
        )

        # Premier scan: valide
        res1 = validate_ticket_scan(ticket.ticket_code, checked_in_by_id=5)
        self.assertTrue(res1["valid"])
        self.assertEqual(res1["status"], "SUCCESS")

        # Second scan: refusé (déjà utilisé)
        res2 = validate_ticket_scan(ticket.ticket_code)
        self.assertFalse(res2["valid"])
        self.assertEqual(res2["status"], "ALREADY_USED")
