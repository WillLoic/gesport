from django.test import TestCase
from django.utils import timezone
from apps.membres.services.member_service import create_member
from apps.medical.services.medical_service import create_medical_record

class MedicalTestCase(TestCase):
    def test_medical_record(self):
        m = create_member(club_id=1, first_name="Hugo", last_name="Lloris", email="hugo@gesport.fr")
        rec = create_medical_record(member_id=m.id, injury_type="Entorse", body_part="Poignet gauche", injury_date=timezone.now().date())
        self.assertEqual(rec.status, "En soins")
        self.assertEqual(rec.body_part, "Poignet gauche")
