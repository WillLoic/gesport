"""Modèle PaymentTransaction — Rapprochement et suivi des transactions de paiement."""

from django.db import models
from apps.orders.models.order import Order


class PaymentTransaction(models.Model):
    """Transaction bancaire ou paiement électronique (Stripe, CB, PayLib, Pass'Sport, Mobile Money)."""

    class Provider(models.TextChoices):
        STRIPE = 'STRIPE', 'Stripe / Carte Bancaire'
        PAYLIB = 'PAYLIB', 'PayLib'
        PASSSPORT = 'PASSSPORT', 'Pass\'Sport'
        MOBILE_MONEY = 'MOBILE_MONEY', 'Mobile Money'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'En attente'
        SUCCESS = 'SUCCESS', 'Succès'
        FAILED = 'FAILED', 'Échec'
        REFUNDED = 'REFUNDED', 'Remboursé'

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    provider = models.CharField(max_length=20, choices=Provider.choices, default=Provider.STRIPE)
    transaction_id = models.CharField(max_length=255, unique=True, db_index=True, help_text="ID externe du paiement")
    
    amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="Montant de la transaction")
    currency = models.CharField(max_length=10, default='EUR')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    
    metadata = models.JSONField(default=dict, blank=True, help_text="Payload / Réponses de la passerelle de paiement")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'shop_payment_transactions'
        ordering = ['-created_at']
        verbose_name = "Transaction de paiement"
        verbose_name_plural = "Transactions de paiement"

    def __str__(self) -> str:
        return f"Paiement [{self.provider}] {self.transaction_id[:16]} - {self.amount} {self.currency} ({self.status})"
