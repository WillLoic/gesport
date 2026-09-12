"""Modèle CustomPrintDetail — Saisie de la personnalisation lors d'un achat."""

from django.db import models
from apps.custom_prints.models.option import CustomPrintOption


class CustomPrintDetail(models.Model):
    """Détail spécifique du flocage renseigné par l'acheteur pour un article."""

    option = models.ForeignKey(
        CustomPrintOption,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='print_details'
    )
    custom_name = models.CharField(max_length=100, blank=True, default="", help_text="Nom à floquer")
    custom_number = models.CharField(max_length=20, blank=True, default="", help_text="Numéro à floquer")
    location = models.CharField(max_length=50, default='BACK', help_text="Emplacement (BACK, CHEST, SLEEVE)")
    font_style = models.CharField(max_length=50, blank=True, default="STANDARD")
    color = models.CharField(max_length=50, blank=True, default="WHITE")
    extra_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'shop_custom_print_details'
        ordering = ['-created_at']
        verbose_name = "Détail de flocage"
        verbose_name_plural = "Détails de flocage"

    def __str__(self) -> str:
        text = f"{self.custom_name} #{self.custom_number}".strip()
        return f"Flocage [{self.location}]: {text or 'Sans texte'}"
