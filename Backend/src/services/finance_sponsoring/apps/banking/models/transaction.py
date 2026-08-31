"""
Modèles Bancaires — Rapprochement bancaire conforme IAS 7 (Tableau des flux de trésorerie).
"""

from decimal import Decimal
from django.db import models


class BankAccount(models.Model):
    """Compte bancaire du club."""

    club_id = models.IntegerField(verbose_name="ID du Club", db_index=True)
    name = models.CharField(max_length=100, verbose_name="Nom du compte (ex: Compte Courant Société Générale)")
    bank_name = models.CharField(max_length=100, verbose_name="Banque")
    iban = models.CharField(max_length=34, blank=True, verbose_name="IBAN")
    bic = models.CharField(max_length=11, blank=True, verbose_name="BIC / SWIFT")
    currency_code = models.CharField(max_length=3, default='EUR', verbose_name="Devise ISO 4217")
    current_balance = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'), verbose_name="Solde actuel")
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'finance_bank_accounts'
        verbose_name = 'Compte Bancaire'
        verbose_name_plural = 'Comptes Bancaires'

    def __str__(self) -> str:
        return f"{self.name} ({self.bank_name}) — {self.current_balance} {self.currency_code}"


class BankTransaction(models.Model):
    """
    Mouvement bancaire importé (IAS 7 — flux de trésorerie).
    Catégories IAS 7 : Exploitation, Investissement, Financement.
    """

    DIRECTION_CHOICES = [
        ('credit', 'Crédit (+) — Entrée de trésorerie'),
        ('debit', 'Débit (-) — Sortie de trésorerie'),
    ]

    CATEGORY_CHOICES = [
        ('operating', 'Activités d\'exploitation (IAS 7)'),
        ('investing', 'Activités d\'investissement (IAS 7)'),
        ('financing', 'Activités de financement (IAS 7)'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Non rapproché'),
        ('reconciled', 'Rapproché'),
        ('disputed', 'Contesté'),
    ]

    account = models.ForeignKey(BankAccount, on_delete=models.CASCADE, related_name='transactions', verbose_name="Compte")
    transaction_date = models.DateField(verbose_name="Date de valeur")
    value_date = models.DateField(verbose_name="Date comptable")
    label = models.CharField(max_length=200, verbose_name="Libellé du relevé bancaire")
    reference = models.CharField(max_length=100, blank=True, verbose_name="Référence banque")

    amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Montant")
    direction = models.CharField(max_length=6, choices=DIRECTION_CHOICES)
    category = models.CharField(max_length=12, choices=CATEGORY_CHOICES, default='operating', verbose_name="Catégorie IAS 7")
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='pending')

    journal_entry_id = models.IntegerField(null=True, blank=True, verbose_name="ID Écriture comptable rapprochée (ledger)")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'finance_bank_transactions'
        verbose_name = 'Transaction Bancaire'
        verbose_name_plural = 'Transactions Bancaires'
        ordering = ['-transaction_date']

    def __str__(self) -> str:
        sign = '+' if self.direction == 'credit' else '-'
        return f"{self.transaction_date} | {sign}{self.amount} | {self.label} [{self.get_status_display()}]"
