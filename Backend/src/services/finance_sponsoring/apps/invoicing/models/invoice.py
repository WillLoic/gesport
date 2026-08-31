"""
Modèles de Facturation & Devis — IFRS 15 (Produits des contrats avec les clients).
"""

from decimal import Decimal
from django.db import models


class Quote(models.Model):
    """Devis commercial émis par le club."""

    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('sent', 'Envoyé'),
        ('accepted', 'Accepté'),
        ('refused', 'Refusé'),
        ('expired', 'Expiré'),
    ]

    club_id = models.IntegerField(verbose_name="ID du Club", db_index=True)
    reference = models.CharField(max_length=50, unique=True, verbose_name="Référence (ex: DEVIS-2026-001)")
    client_name = models.CharField(max_length=150, verbose_name="Nom du client")
    client_email = models.EmailField(blank=True, default='', verbose_name="Email du client")

    issue_date = models.DateField(verbose_name="Date d'émission")
    validity_date = models.DateField(verbose_name="Date de validité")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')

    amount_excl_tax = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name="Montant HT")
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('20.00'), verbose_name="Taux TVA (%)")
    amount_incl_tax = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name="Montant TTC")
    notes = models.TextField(blank=True, default='', verbose_name="Conditions & Remarques")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'finance_quotes'
        verbose_name = 'Devis'
        verbose_name_plural = 'Devis'
        ordering = ['-issue_date']

    def __str__(self) -> str:
        return f"{self.reference} | {self.client_name} | {self.get_status_display()}"


class Invoice(models.Model):
    """
    Facture émise par le club (IFRS 15 — reconnaissance du produit à la date de prestation).
    """

    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('sent', 'Émise'),
        ('paid', 'Payée'),
        ('overdue', 'En retard'),
        ('cancelled', 'Annulée'),
        ('credited', 'Avoirs émis'),
    ]

    club_id = models.IntegerField(verbose_name="ID du Club", db_index=True)
    number = models.CharField(max_length=50, unique=True, verbose_name="Numéro de facture (ex: FAC-2026-001)")
    quote = models.OneToOneField(Quote, null=True, blank=True, on_delete=models.SET_NULL, related_name='invoice', verbose_name="Devis d'origine")

    client_name = models.CharField(max_length=150, verbose_name="Nom du client")
    client_email = models.EmailField(blank=True, default='', verbose_name="Email client")
    client_address = models.TextField(blank=True, default='', verbose_name="Adresse de facturation")

    issue_date = models.DateField(verbose_name="Date d'émission")
    due_date = models.DateField(verbose_name="Date d'échéance")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')

    amount_excl_tax = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name="Montant HT")
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('20.00'), verbose_name="Taux TVA (%)")
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name="Montant TVA")
    amount_incl_tax = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name="Montant TTC")

    currency_code = models.CharField(max_length=3, default='EUR', verbose_name="Devise ISO 4217")
    notes = models.TextField(blank=True, default='', verbose_name="Mentions légales & Remarques")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'finance_invoices'
        verbose_name = 'Facture'
        verbose_name_plural = 'Factures'
        ordering = ['-issue_date']

    def __str__(self) -> str:
        return f"{self.number} | {self.client_name} | {self.amount_incl_tax}€ | {self.get_status_display()}"

    def save(self, *args, **kwargs):
        """Calcul automatique TVA et TTC avant sauvegarde."""
        if self.amount_excl_tax and self.tax_rate:
            self.tax_amount = (self.amount_excl_tax * self.tax_rate / 100).quantize(Decimal('0.01'))
            self.amount_incl_tax = self.amount_excl_tax + self.tax_amount
        super().save(*args, **kwargs)


class InvoiceItem(models.Model):
    """Ligne de détail d'une facture."""

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items', verbose_name="Facture")
    description = models.CharField(max_length=200, verbose_name="Description de la prestation")
    quantity = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('1.00'), verbose_name="Quantité")
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Prix unitaire HT")
    total = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Total HT")

    class Meta:
        db_table = 'finance_invoice_items'
        verbose_name = 'Ligne de Facture'

    def save(self, *args, **kwargs):
        self.total = (self.quantity * self.unit_price).quantize(Decimal('0.01'))
        super().save(*args, **kwargs)
