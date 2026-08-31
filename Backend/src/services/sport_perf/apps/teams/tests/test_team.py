from django.test import TestCase
from apps.teams.services.team_service import create_team, add_player_to_team
from apps.membres.services.member_service import create_member

class TeamTestCase(TestCase):
    def test_create_team_and_add_player(self):
        m = create_member(club_id=1, first_name="Paul", last_name="Bernard", email="paul@gesport.fr")
        team = create_team(club_id=1, name="Seniors A Volley", sport_type="volleyball")
        tp = add_player_to_team(team=team, member_id=m.id, jersey_number=7, position="Passeur")
        self.assertEqual(tp.jersey_number, 7)
        self.assertEqual(team.players.count(), 1)
