"""Modèle pour les catégories de billets et tarification d'un événement."""

from django.db import models
from apps.ticketing.models.event import TicketEvent


class TicketCategory(models.Model):
    """Catégorie de place / tarif pour un événement (ex: Tribune VIP, Tarif Enfant)."""
    event = models.ForeignKey(TicketEvent, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=100, help_text="Nom de la catégorie (ex: Tribune VIP, Standard, Enfant)")
    description = models.TextField(blank=True, default="")
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Prix unitaire du billet")
    currency = models.CharField(max_length=10, default='XAF', help_text="Devise (XAF, EUR, USD)")
    
    total_capacity = models.PositiveIntegerField(help_text="Quota total de billets disponibles pour cette catégorie")
    sold_count = models.PositiveIntegerField(default=0, help_text="Nombre de billets déjà vendus/réservés")
    is_active = models.BooleanField(default=True, help_text="Catégorie ouverte à la vente")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'cms_ticket_category'
        ordering = ['price']
        verbose_name = "Catégorie de billet"
        verbose_name_plural = "Catégories de billets"

    @property
    def available_tickets(self) -> int:
        return max(0, self.total_capacity - self.sold_count)

    def __str__(self):
        return f"{self.event.title} - {self.name} ({self.price} {self.currency})"
