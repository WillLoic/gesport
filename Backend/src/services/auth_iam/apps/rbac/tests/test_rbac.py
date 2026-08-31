"""
Tests unitaires pour l'application rbac.
Vérifie l'initialisation des rôles système, l'attribution et la révocation de rôles dans un club.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model

from apps.club.services.club_service import create_club
from apps.rbac.models.role import Role
from apps.rbac.services.rbac_service import init_default_roles, assign_role_to_user, revoke_role_from_user
from apps.rbac.selectors.rbac_selector import has_club_role, get_user_roles_in_club

User = get_user_model()


class RbacTestCase(TestCase):
    def setUp(self):
        init_default_roles()
        self.admin = User.objects.create_user(
            email="admin@gesport.fr",
            password="Password123!",
            first_name="Boss",
            last_name="President"
        )
        self.coach = User.objects.create_user(
            email="coach@gesport.fr",
            password="Password123!",
            first_name="Entraineur",
            last_name="Principal"
        )
        self.club = create_club(name="Stade Français", creator=self.admin)

    def test_init_default_roles(self):
        roles_count = Role.objects.count()
        self.assertEqual(roles_count, 7)

    def test_assign_and_revoke_role(self):
        assignment = assign_role_to_user(
            user=self.coach,
            club=self.club,
            role_code=Role.COACH,
            assigned_by=self.admin
        )
        self.assertIsNotNone(assignment)
        self.assertTrue(has_club_role(self.coach, self.club, Role.COACH))

        # Test de révocation
        revoke_role_from_user(user=self.coach, club=self.club, role_code=Role.COACH)
        self.assertFalse(has_club_role(self.coach, self.club, Role.COACH))
