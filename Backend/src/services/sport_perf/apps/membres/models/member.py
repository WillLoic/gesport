"""
Modèle Member — Registre des adhérents et licenciés d'un club sportif.
"""

from django.db import models


class Member(models.Model):
    """
    Représente un membre / licencié au sein du club.
    """
    CATEGORY_CHOICES = [
        ('Baby/U9', 'Baby / U9'),
        ('U11', 'U11'),
        ('U13', 'U13'),
        ('U15', 'U15'),
        ('U18', 'U18'),
        ('Senior Régionale', 'Senior Régionale'),
        ('Senior Nationale', 'Senior Nationale'),
        ('Loisir / Masters', 'Loisir / Masters'),
        ('Pro Élite', 'Pro Élite'),
    ]

    LICENSE_STATUS_CHOICES = [
        ('Validée', 'Validée'),
        ('En attente', 'En attente'),
        ('Expirée', 'Expirée'),
        ('Paiement partiel', 'Paiement partiel'),
    ]

    # Rattachement au club et optionnellement au compte utilisateur (auth_iam)
    club_id = models.IntegerField(verbose_name="ID du Club", db_index=True)
    user_id = models.IntegerField(null=True, blank=True, verbose_name="ID Utilisateur IAM", db_index=True)

    first_name = models.CharField(max_length=100, verbose_name="Prénom")
    last_name = models.CharField(max_length=100, verbose_name="Nom")
    email = models.EmailField(verbose_name="Adresse email")
    phone = models.CharField(max_length=20, blank=True, default='', verbose_name="Téléphone")
    gender = models.CharField(max_length=10, choices=[('M', 'Masculin'), ('F', 'Féminin')], default='M')
    birth_date = models.DateField(null=True, blank=True, verbose_name="Date de naissance")

    # Sport & Catégorie
    sport_type = models.CharField(max_length=30, default='football', verbose_name="Sport principal")
    category = models.CharField(max_length=40, choices=CATEGORY_CHOICES, default='Senior Régionale')

    # Licence fédérale
    license_number = models.CharField(max_length=50, blank=True, default='', verbose_name="Numéro de licence")
    license_status = models.CharField(max_length=30, choices=LICENSE_STATUS_CHOICES, default='En attente')

    # Certificat médical
    medical_cert_valid = models.BooleanField(default=False, verbose_name="Certificat médical valide")
    medical_cert_date = models.DateField(null=True, blank=True, verbose_name="Date du certificat médical")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sport_members'
        verbose_name = 'Adhérent'
        verbose_name_plural = 'Adhérents'
        ordering = ['last_name', 'first_name']

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name} ({self.category})"

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
