"""
Tests unitaires pour l'application club.
Vérifie la création de club, génération de slug, saisons et adhésions.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from datetime import date

from apps.club.services.club_service import create_club, create_season, add_user_to_club
from apps.club.selectors.club_selector import list_user_clubs

User = get_user_model()


class ClubTestCase(TestCase):
    def setUp(self):
        self.creator = User.objects.create_user(
            email="creator@gesport.fr",
            password="Password123!",
            first_name="Admin",
            last_name="Club"
        )
        self.member = User.objects.create_user(
            email="member@gesport.fr",
            password="Password123!",
            first_name="Joueur",
            last_name="Un"
        )

    def test_create_club_slug_and_membership(self):
        club = create_club(
            name="AS Montrouge Omnisports",
            short_name="ASMO",
            creator=self.creator
        )
        self.assertEqual(club.slug, "as-montrouge-omnisports")
        self.assertTrue(club.members.filter(user=self.creator, is_active=True).exists())

    def test_create_season(self):
        club = create_club(name="BC Paris", creator=self.creator)
        season = create_season(
            club=club,
            name="2025-2026",
            start_date=date(2025, 9, 1),
            end_date=date(2026, 6, 30),
            set_as_current=True
        )
        self.assertTrue(season.is_current)
        self.assertEqual(club.seasons.count(), 1)

    def test_add_member_to_club(self):
        club = create_club(name="FC Versailles", creator=self.creator)
        membership = add_user_to_club(user=self.member, club=club)
        self.assertTrue(membership.is_active)
        user_clubs = list_user_clubs(self.member)
        self.assertIn(club, user_clubs)
