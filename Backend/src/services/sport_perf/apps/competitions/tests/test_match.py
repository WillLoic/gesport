from django.test import TestCase
from django.utils import timezone
# pyrefly: ignore [missing-import]
from apps.teams.services.team_service import create_team
# pyrefly: ignore [missing-import]
from apps.membres.services.member_service import create_member
# pyrefly: ignore [missing-import]
from apps.competitions.services.match_service import create_match, add_callup, update_match_stats

class MatchTestCase(TestCase):
    def test_create_match_callup_and_stats(self):
        m = create_member(club_id=1, first_name="Antoine", last_name="Griezmann", email="antoine@gesport.fr")
        team = create_team(club_id=1, name="Équipe Première", sport_type="football")
        match = create_match(team_id=team.id, opponent_name="FC Nantes", match_date=timezone.now(), is_home=True)
        callup = add_callup(match=match, member_id=m.id, status="Convoqué")
        stats = update_match_stats(match=match, member_id=m.id, points=2, assists=1, is_mvp=True)

        self.assertEqual(match.opponent_name, "FC Nantes")
        self.assertEqual(callup.status, "Convoqué")
        self.assertTrue(stats.is_mvp)
