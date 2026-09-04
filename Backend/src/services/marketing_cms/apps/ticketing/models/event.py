"""Modèle représentant un événement sportif ou culturel soumis à la billetterie."""

from django.db import models
from django.utils.text import slugify


class TicketEvent(models.Model):
    """Événement sportif / gala / tournoi avec billetterie."""

    class EventType(models.TextChoices):
        MATCH = 'MATCH', 'Match de championnat / coupe'
        STAGE = 'STAGE', 'Stage de vacances / perfectionnement'
        GALA = 'GALA', 'Soirée de Gala'
        TOURNOI = 'TOURNOI', 'Tournoi'
        AUTRE = 'AUTRE', 'Autre événement'

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Brouillon'
        OPEN = 'OPEN', 'Billetterie Ouverte'
        CLOSED = 'CLOSED', 'Billetterie Fermée'
        CANCELLED = 'CANCELLED', 'Événement Annulé'

    club_id = models.BigIntegerField(db_index=True, help_text="ID du club organisateur")
    title = models.CharField(max_length=255, help_text="Titre de l'événement")
    slug = models.SlugField(max_length=255, db_index=True, help_text="Slug URL unique pour le club")
    event_type = models.CharField(max_length=50, choices=EventType.choices, default=EventType.MATCH)
    description = models.TextField(blank=True, default="", help_text="Description de l'événement")
    location = models.CharField(max_length=255, help_text="Lieu / Stade / Gymnase")
    
    start_date = models.DateTimeField(help_text="Date et heure de début")
    end_date = models.DateTimeField(null=True, blank=True, help_text="Date et heure de fin")
    
    cover_image_url = models.URLField(max_length=1000, blank=True, null=True, help_text="Affiche / Image de couverture")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'cms_ticket_event'
        ordering = ['-start_date']
        unique_together = ('club_id', 'slug')
        verbose_name = "Événement Billetterie"
        verbose_name_plural = "Événements Billetterie"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.get_event_type_display()}) - {self.status}"
