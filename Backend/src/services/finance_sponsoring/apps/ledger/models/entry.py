"""
Modèles du Grand Livre Comptable — Compatible IAS/IFRS (normes internationales).

Architecture :
  - AccountPlan : Plan comptable à 4 niveaux (classe, compte, sous-compte, analytique)
  - FiscalYear  : Exercice comptable avec statut de clôture
  - JournalEntry: Écriture comptable en partie double (débit = crédit)

Conformité IAS/IFRS :
  - IAS 1  : Présentation des états financiers
  - IAS 8  : Méthodes comptables, changements d'estimations
  - IFRS 9 : Instruments financiers (champ currency_code pour multi-devises)
  - Double-entry bookkeeping universel : toute écriture Débit = Crédit
"""

from decimal import Decimal
from django.db import models


class AccountPlan(models.Model):
    """
    Plan comptable du club.
    Hiérarchie : Classe > Compte > Sous-compte (compatible IAS/IFRS et plans nationaux).
    """

    ACCOUNT_TYPE_CHOICES = [
        # Bilan (IAS 1)
        ('asset', 'Actif (Asset)'),
        ('liability', 'Passif (Liability)'),
        ('equity', 'Capitaux propres (Equity)'),
        # Compte de résultat (IAS 1)
        ('revenue', 'Produit (Revenue)'),
        ('expense', 'Charge (Expense)'),
    ]

    club_id = models.IntegerField(verbose_name="ID du Club", db_index=True)
    code = models.CharField(max_length=20, verbose_name="Code du compte (ex: 4120, 7060)")
    label = models.CharField(max_length=150, verbose_name="Libellé du compte")
    account_type = models.CharField(max_length=15, choices=ACCOUNT_TYPE_CHOICES, verbose_name="Type IAS/IFRS")
    parent_code = models.CharField(max_length=20, blank=True, default='', verbose_name="Code compte parent (hiérarchie)")
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'finance_account_plan'
        verbose_name = 'Compte (Plan Comptable)'
        verbose_name_plural = 'Plan Comptable'
        unique_together = [['club_id', 'code']]
        ordering = ['code']

    def __str__(self) -> str:
        return f"[{self.code}] {self.label} ({self.get_account_type_display()})"


class FiscalYear(models.Model):
    """
    Exercice comptable (IAS 1 §36 — période de 12 mois maximum).
    """

    STATUS_CHOICES = [
        ('open', 'Ouvert'),
        ('closed', 'Clôturé'),
        ('archived', 'Archivé'),
    ]

    club_id = models.IntegerField(verbose_name="ID du Club", db_index=True)
    label = models.CharField(max_length=50, verbose_name="Libellé (ex: Exercice 2025-2026)")
    start_date = models.DateField(verbose_name="Date de début")
    end_date = models.DateField(verbose_name="Date de fin")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open')

    class Meta:
        db_table = 'finance_fiscal_years'
        verbose_name = 'Exercice Comptable'
        verbose_name_plural = 'Exercices Comptables'
        ordering = ['-start_date']

    def __str__(self) -> str:
        return f"{self.label} ({self.get_status_display()})"


class JournalEntry(models.Model):
    """
    Écriture comptable en partie double (double-entry bookkeeping).
    Principe fondamental IFRS : pour chaque transaction, Σ Débits = Σ Crédits.

    Journaux (IAS 1) :
      - ACH : Achats / Dépenses
      - VTE : Ventes / Produits
      - BNQ : Banque
      - OD  : Opérations Diverses
      - SAL : Salaires & Charges sociales
      - IMM : Immobilisations
    """

    JOURNAL_CHOICES = [
        ('ACH', 'Achats'),
        ('VTE', 'Ventes'),
        ('BNQ', 'Banque'),
        ('OD', 'Opérations Diverses'),
        ('SAL', 'Salaires'),
        ('IMM', 'Immobilisations'),
    ]

    club_id = models.IntegerField(verbose_name="ID du Club", db_index=True)
    fiscal_year = models.ForeignKey(FiscalYear, on_delete=models.PROTECT, related_name='entries', verbose_name="Exercice")
    account = models.ForeignKey(AccountPlan, on_delete=models.PROTECT, related_name='entries', verbose_name="Compte")

    journal = models.CharField(max_length=3, choices=JOURNAL_CHOICES, verbose_name="Journal")
    entry_date = models.DateField(verbose_name="Date comptable")
    reference = models.CharField(max_length=50, verbose_name="Référence pièce (n° facture, virement…)")
    label = models.CharField(max_length=200, verbose_name="Libellé de l'écriture")

    # Montants en partie double (IAS 32 / IFRS 9)
    debit = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'), verbose_name="Débit (€)")
    credit = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'), verbose_name="Crédit (€)")

    # Multi-devises (IFRS 9 / IAS 21)
    currency_code = models.CharField(max_length=3, default='EUR', verbose_name="Code devise ISO 4217 (EUR, USD, GBP…)")
    exchange_rate = models.DecimalField(max_digits=10, decimal_places=6, default=Decimal('1.000000'), verbose_name="Taux de change vers EUR")

    is_validated = models.BooleanField(default=False, verbose_name="Écriture validée (non modifiable)")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'finance_journal_entries'
        verbose_name = 'Écriture Comptable'
        verbose_name_plural = 'Écritures Comptables'
        ordering = ['-entry_date', '-created_at']

    def __str__(self) -> str:
        return f"[{self.journal}] {self.entry_date} | {self.account.code} | {self.label} | D:{self.debit} C:{self.credit}"
