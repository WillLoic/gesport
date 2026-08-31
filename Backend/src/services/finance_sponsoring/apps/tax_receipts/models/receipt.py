"""
Modèles Reçus Fiscaux — Gestion des dons et reçus Cerfa 2041-RD.
Applicable aux associations loi 1901 reconnues d'intérêt général (France).
Note : Le modèle est générique et adaptable aux équivalents internationaux
(Gift Aid UK, 501(c)(3) US, etc.)
"""

from decimal import Decimal
from django.db import models


class Donor(models.Model):
    """Donateur (personne physique ou morale)."""

    DONOR_TYPE_CHOICES = [
        ('individual', 'Personne physique'),
        ('company', 'Personne morale / Entreprise'),
    ]

    club_id = models.IntegerField(verbose_name="ID du Club", db_index=True)
    donor_type = models.CharField(max_length=12, choices=DONOR_TYPE_CHOICES, default='individual')
    first_name = models.CharField(max_length=100, blank=True, default='', verbose_name="Prénom")
    last_name = models.CharField(max_length=100, verbose_name="Nom / Raison sociale")
    email = models.EmailField(verbose_name="Email")
    address = models.TextField(blank=True, default='', verbose_name="Adresse postale fiscale")
    tax_id = models.CharField(max_length=50, blank=True, default='', verbose_name="Numéro fiscal / SIRET")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'finance_donors'
        verbose_name = 'Donateur'
        verbose_name_plural = 'Donateurs'

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()


class TaxReceipt(models.Model):
    """
    Reçu fiscal pour déduction d'impôt.
    France : Cerfa n° 11580*03 (2041-RD) — applicable aux associations d'intérêt général.
    International : Adaptable aux normes locales (Gift Aid, 501c3…).
    """

    STATUS_CHOICES = [
        ('issued', 'Émis'),
        ('cancelled', 'Annulé'),
        ('reissued', 'Réémis (correction)'),
    ]

    DONATION_TYPE_CHOICES = [
        ('money', 'Don en numéraire'),
        ('kind', 'Don en nature'),
        ('skills', 'Mécénat de compétences'),
    ]

    club_id = models.IntegerField(verbose_name="ID du Club", db_index=True)
    receipt_number = models.CharField(max_length=50, unique=True, verbose_name="Numéro du reçu (ex: CERFA-2026-0001)")
    donor = models.ForeignKey(Donor, on_delete=models.PROTECT, related_name='receipts', verbose_name="Donateur")

    donation_date = models.DateField(verbose_name="Date du don")
    donation_type = models.CharField(max_length=6, choices=DONATION_TYPE_CHOICES, default='money')
    amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Montant du don")
    description = models.CharField(max_length=200, blank=True, default='', verbose_name="Objet du don (si en nature)")

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='issued')
    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'finance_tax_receipts'
        verbose_name = 'Reçu Fiscal'
        verbose_name_plural = 'Reçus Fiscaux'
        ordering = ['-issued_at']

    def __str__(self) -> str:
        return f"{self.receipt_number} | {self.donor} | {self.amount}€ | {self.get_status_display()}"
