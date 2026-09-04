"""Tests unitaires pour l'application campaigns."""

from django.test import TestCase
from apps.campaigns.models import AudienceSegment, Campaign, CampaignRecipientLog
from apps.campaigns.services.campaign_engine import execute_campaign
from apps.campaigns.services.brevo_service import BrevoService
from apps.campaigns.services.geskap_service import GeskapWhatsAppService


class CampaignsTestCase(TestCase):
    def setUp(self):
        self.segment = AudienceSegment.objects.create(
            club_id=1,
            name="Parents U15",
            description="Parents des joueurs U15",
            filters={"recipient_list": [{"contact": "parent1@gesport.com", "id": 10}]}
        )
        self.campaign = Campaign.objects.create(
            club_id=1,
            title="Convocation Match Samedi",
            channel=Campaign.Channel.EMAIL,
            segment=self.segment,
            subject="Convocation U15",
            content="Rendez-vous samedi à 14h au stade."
        )

    def test_campaign_creation(self):
        self.assertEqual(self.campaign.status, Campaign.Status.DRAFT)
        self.assertEqual(self.campaign.segment.name, "Parents U15")

    def test_brevo_mock_email(self):
        service = BrevoService()
        res = service.send_email("test@gesport.com", "Sujet", "Contenu")
        self.assertTrue(res["success"])
        self.assertIn("mock_email", res["message_id"])

    def test_geskap_mock_whatsapp(self):
        service = GeskapWhatsAppService()
        res = service.send_whatsapp_message("+33612345678", "Bonjour WhatsApp")
        self.assertTrue(res["success"])
        self.assertIn("mock_wa", res["message_id"])

    def test_execute_campaign_engine(self):
        executed = execute_campaign(self.campaign.id)
        self.assertEqual(executed.status, Campaign.Status.SENT)
        self.assertEqual(executed.delivered_count, 1)
        self.assertEqual(CampaignRecipientLog.objects.filter(campaign=self.campaign).count(), 1)
