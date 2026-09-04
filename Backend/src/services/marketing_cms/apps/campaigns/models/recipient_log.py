"""Modèle pour le suivi individuel de l'envoi d'une campagne par destinataire."""

from django.db import models
from apps.campaigns.models.campaign import Campaign


class CampaignRecipientLog(models.Model):
    """Journal individuel d'expédition pour chaque destinataire."""

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'En attente'
        SENT = 'SENT', 'Envoyé'
        DELIVERED = 'DELIVERED', 'Délivré'
        FAILED = 'FAILED', 'Échec'

    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='recipient_logs')
    recipient_contact = models.CharField(max_length=255, help_text="Adresse Email ou numéro de téléphone")
    recipient_id = models.BigIntegerField(null=True, blank=True, help_text="ID du licencié/membre si disponible")
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    external_message_id = models.CharField(max_length=255, blank=True, null=True, help_text="ID du message retourné par Brevo/Geskap")
    error_message = models.TextField(blank=True, null=True, help_text="Raison de l'échec si statut FAILED")
    
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'cms_campaign_recipient_log'
        ordering = ['-created_at']
        verbose_name = "Log destinataire campagne"
        verbose_name_plural = "Logs destinataires campagne"

    def __str__(self):
        return f"{self.campaign.title} -> {self.recipient_contact} ({self.status})"
