"""Modèle représentant une campagne marketing multi-canal (Email, SMS, WhatsApp)."""

from django.db import models
from apps.campaigns.models.audience import AudienceSegment


class Campaign(models.Model):
    """Campagne de communication envoyée par Email, SMS ou WhatsApp."""

    class Channel(models.TextChoices):
        EMAIL = 'EMAIL', 'Email'
        SMS = 'SMS', 'SMS'
        WHATSAPP = 'WHATSAPP', 'WhatsApp'

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Brouillon'
        SCHEDULED = 'SCHEDULED', 'Planifiée'
        SENDING = 'SENDING', 'En cours d\'envoi'
        SENT = 'SENT', 'Envoyée'
        FAILED = 'FAILED', 'Échouée'
        CANCELLED = 'CANCELLED', 'Annulée'

    club_id = models.BigIntegerField(db_index=True, help_text="ID du club organisateur")
    title = models.CharField(max_length=255, help_text="Titre / Nom interne de la campagne")
    channel = models.CharField(max_length=20, choices=Channel.choices, default=Channel.EMAIL)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    
    segment = models.ForeignKey(
        AudienceSegment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='campaigns',
        help_text="Segment d'audience ciblé"
    )
    
    subject = models.CharField(max_length=255, blank=True, default="", help_text="Objet (pour les e-mails)")
    content = models.TextField(help_text="Contenu du message (Texte, HTML ou Markdown)")
    media_url = models.URLField(max_length=1000, blank=True, null=True, help_text="Média/Visuel joint (ex: image WhatsApp ou PJ email)")

    scheduled_at = models.DateTimeField(null=True, blank=True, help_text="Date/heure de planification d'envoi")
    sent_at = models.DateTimeField(null=True, blank=True, help_text="Date/heure réelle d'envoi")

    # Statistiques de campagne
    total_recipients = models.PositiveIntegerField(default=0)
    delivered_count = models.PositiveIntegerField(default=0)
    opened_count = models.PositiveIntegerField(default=0)
    clicked_count = models.PositiveIntegerField(default=0)
    failed_count = models.PositiveIntegerField(default=0)

    created_by_id = models.BigIntegerField(null=True, blank=True, help_text="ID de l'utilisateur créateur")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'cms_campaign'
        ordering = ['-created_at']
        verbose_name = "Campagne marketing"
        verbose_name_plural = "Campagnes marketing"

    def __str__(self):
        return f"[{self.channel}] {self.title} - Status: {self.status}"
