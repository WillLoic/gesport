"""Modèle représentant un billet individuel acheté avec son QR Code sécurisé."""

import uuid
from django.db import models
from apps.ticketing.models.event import TicketEvent
from apps.ticketing.models.category import TicketCategory


class Ticket(models.Model):
    """Billet individuel généré pour un acheteur."""

    class Status(models.TextChoices):
        VALID = 'VALID', 'Valide'
        USED = 'USED', 'Utilisé (Scanné à l\'entrée)'
        CANCELLED = 'CANCELLED', 'Annulé / Remboursé'

    ticket_code = models.CharField(
        max_length=64,
        unique=True,
        default=uuid.uuid4,
        db_index=True,
        help_text="Code unique alphanumérique / UUID du billet"
    )
    event = models.ForeignKey(TicketEvent, on_delete=models.CASCADE, related_name='tickets')
    category = models.ForeignKey(TicketCategory, on_delete=models.CASCADE, related_name='tickets')
    
    buyer_name = models.CharField(max_length=255, help_text="Nom complet de l'acheteur/détenteur")
    buyer_email = models.EmailField(help_text="Adresse email du destinataire du billet")
    buyer_phone = models.CharField(max_length=50, blank=True, default="", help_text="Téléphone du détenteur")
    
    price_paid = models.DecimalField(max_digits=10, decimal_places=2, help_text="Montant payé pour le billet")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.VALID)
    
    qr_code_data = models.TextField(blank=True, default="", help_text="Signature HMAC / Données encodées dans le QR code")
    
    checked_in_at = models.DateTimeField(null=True, blank=True, help_text="Horodatage du scan à l'entrée")
    checked_in_by_id = models.BigIntegerField(null=True, blank=True, help_text="ID du contrôleur/agent qui a scanné le billet")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'cms_ticket'
        ordering = ['-created_at']
        verbose_name = "Billet"
        verbose_name_plural = "Billets"

    def __str__(self):
        return f"Billet #{self.ticket_code[:8]} - {self.buyer_name} ({self.status})"
