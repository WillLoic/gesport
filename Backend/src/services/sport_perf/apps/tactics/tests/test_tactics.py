from django.test import TestCase
from apps.tactics.services.tactics_service import create_tactical_board, create_training_exercise

class TacticsTestCase(TestCase):
    def test_create_board_and_exercise(self):
        board = create_tactical_board(club_id=1, title="Attaque 5-1 Volley", system_name="5-1", sport_type="volleyball")
        ex = create_training_exercise(club_id=1, title="Service Smashé", sport_type="volleyball", duration_minutes=20)
        self.assertEqual(board.system_name, "5-1")
        self.assertEqual(ex.duration_minutes, 20)
