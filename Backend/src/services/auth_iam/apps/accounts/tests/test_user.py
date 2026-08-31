"""
Tests unitaires pour l'application accounts.
Vérifie la création d'utilisateurs, l'authentification JWT et la 2FA.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

# pyrefly: ignore [missing-import]
from apps.accounts.services.user_service import create_user, authenticate_user, generate_2fa_setup, verify_and_activate_2fa

User = get_user_model()


class AccountsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_data = {
            "email": "testuser@gesport.fr",
            "password": "Password123!",
            "first_name": "Jean",
            "last_name": "Dupont",
            "phone_number": "0601020304"
        }

    def test_create_user_service(self):
        user = create_user(**self.user_data)
        self.assertEqual(user.email, "testuser@gesport.fr")
        self.assertTrue(user.check_password("Password123!"))
        self.assertIsNotNone(user.profile)

    def test_authenticate_user_service(self):
        create_user(**self.user_data)
        tokens = authenticate_user(email="testuser@gesport.fr", password="Password123!")
        self.assertIn("access", tokens)
        self.assertIn("refresh", tokens)

    def test_register_api_view(self):
        response = self.client.post(
            "/api/v1/auth/accounts/register/",
            {
                "email": "apiuser@gesport.fr",
                "password": "Password123!",
                "password_confirm": "Password123!",
                "first_name": "Pierre",
                "last_name": "Martin",
                "phone_number": "0600000000"
            },
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="apiuser@gesport.fr").exists())

    def test_login_api_view(self):
        create_user(**self.user_data)
        response = self.client.post(
            "/api/v1/auth/accounts/login/",
            {
                "email": "testuser@gesport.fr",
                "password": "Password123!"
            },
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
