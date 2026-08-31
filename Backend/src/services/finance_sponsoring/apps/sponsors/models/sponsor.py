"""
Modèles Sponsoring & Partenariats B2B.
Gestion des sponsors, packs de contreparties et contrats de partenariat.
"""

from decimal import Decimal
from django.db import models


class Sponsor(models.Model):
    """Partenaire ou Sponsor B2B du club."""

    SPONSOR_TYPE_CHOICES = [
        ('corporate', 'Entreprise B2B / PME'),
        ('institutional', 'Institutionnel / Collectivité'),
        ('local_business', 'Commerce local'),
        ('patron', 'Mécène privé'),
    ]

    STATUS_CHOICES = [
        ('prospect', 'Prospect'),
        ('active', 'Partenaire Actif'),
        ('inactive', 'Inactif / Ancien Partenaire'),
    ]

    club_id = models.IntegerField(verbose_name="ID du Club", db_index=True)
    company_name = models.CharField(max_length=150, verbose_name="Raison sociale / Nom entreprise")
    sponsor_type = models.CharField(max_length=20, choices=SPONSOR_TYPE_CHOICES, default='corporate')
    siret = models.CharField(max_length=14, blank=True, default='', verbose_name="Numéro SIRET / ID Legal")

    contact_name = models.CharField(max_length=100, verbose_name="Nom de l'interlocuteur / Contact")
    contact_email = models.EmailField(verbose_name="Email de contact")
    contact_phone = models.CharField(max_length=30, blank=True, default='', verbose_name="Téléphone")
    website = models.URLField(blank=True, default='', verbose_name="Site Web")
    logo_url = models.URLField(blank=True, default='', verbose_name="URL du Logo")

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='prospect')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'finance_sponsors'
        verbose_name = 'Sponsor / Partenaire'
        verbose_name_plural = 'Sponsors & Partenaires'
        ordering = ['company_name']

    def __str__(self) -> str:
        return f"{self.company_name} ({self.get_sponsor_type_display()}) — [{self.get_status_display()}]"


class SponsorshipPack(models.Model):
    """Pack ou offre de partenariat prédéfinie (Or, Argent, Bronze, Sur-Mesure...)."""

    club_id = models.IntegerField(verbose_name="ID du Club", db_index=True)
    name = models.CharField(max_length=100, verbose_name="Nom du pack (ex: Pack Maillot Or)")
    price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Prix de référence HT")
    description = models.TextField(blank=True, default='', verbose_name="Description des prestations")
    benefits = models.TextField(blank=True, default='', verbose_name="Contreparties (ex: Panneaux terrain, Flocage, 10 places VIP)")
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'finance_sponsorship_packs'
        verbose_name = 'Pack de Sponsoring'
        verbose_name_plural = 'Packs de Sponsoring'

    def __str__(self) -> str:
        return f"{self.name} — {self.price}€ HT"


class SponsorshipContract(models.Model):
    """Contrat de partenariat conclu avec un sponsor."""

    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('signed', 'Signé / En cours'),
        ('terminated', 'Résilié'),
        ('expired', 'Expiré'),
    ]

    club_id = models.IntegerField(verbose_name="ID du Club", db_index=True)
    contract_number = models.CharField(max_length=50, unique=True, verbose_name="Numéro de contrat (ex: CTR-2026-001)")
    sponsor = models.ForeignKey(Sponsor, on_delete=models.PROTECT, related_name='contracts', verbose_name="Sponsor")
    pack = models.ForeignKey(SponsorshipPack, null=True, blank=True, on_delete=models.SET_NULL, related_name='contracts', verbose_name="Pack lié")

    start_date = models.DateField(verbose_name="Date de début")
    end_date = models.DateField(verbose_name="Date de fin")
    amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Montant négocié HT")

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    notes = models.TextField(blank=True, default='', verbose_name="Clauses particulières & Notes")

    # Liens optionnels vers les pièces comptables
    invoice_id = models.IntegerField(null=True, blank=True, verbose_name="ID Facture liée (invoicing)")
    tax_receipt_id = models.IntegerField(null=True, blank=True, verbose_name="ID Reçu fiscal lié (tax_receipts)")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'finance_sponsorship_contracts'
        verbose_name = 'Contrat de Sponsoring'
        verbose_name_plural = 'Contrats de Sponsoring'
        ordering = ['-start_date']

    def __str__(self) -> str:
        return f"{self.contract_number} | {self.sponsor.company_name} | {self.amount}€ HT [{self.get_status_display()}]"

