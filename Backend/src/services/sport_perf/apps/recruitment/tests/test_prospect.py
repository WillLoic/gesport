from django.test import TestCase
from apps.recruitment.services.prospect_service import create_prospect

class RecruitmentTestCase(TestCase):
    def test_prospect_radar(self):
        p = create_prospect(club_id=1, first_name="Kylian", last_name="Mbappé", birth_year=2004, position="Attaquant", sport_type="football")
        self.assertEqual(p.first_name, "Kylian")
        self.assertIn("vitesse", p.radar_scores_json)
        self.assertEqual(p.radar_scores_json["vitesse"], 8)
