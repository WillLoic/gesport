from django.test import TestCase
from apps.membres.services.member_service import create_member, update_member
from apps.membres.selectors.member_selector import list_club_members

class MemberTestCase(TestCase):
    def test_create_member(self):
        m = create_member(
            club_id=1,
            first_name="Lucas",
            last_name="Moreau",
            email="lucas@gesport.fr",
            category="U18",
            sport_type="volleyball"
        )
        self.assertEqual(m.full_name, "Lucas Moreau")
        self.assertEqual(m.category, "U18")

    def test_list_club_members(self):
        create_member(club_id=1, first_name="Marc", last_name="Dupont", email="marc@gesport.fr")
        members = list_club_members(1)
        self.assertEqual(members.count(), 1)
