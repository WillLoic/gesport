"""Modèle CustomPrintOption — Options de flocage et personnalisation du club."""

from django.db import models


class CustomPrintOption(models.Model):
    """Option de flocage disponible pour les équipements (ex: Flocage Nom + Numéro)."""

    class PrintType(models.TextChoices):
        NAME_NUMBER = 'NAME_NUMBER', 'Nom + Numéro'
        NUMBER_ONLY = 'NUMBER_ONLY', 'Numéro Seul'
        NAME_ONLY = 'NAME_ONLY', 'Nom Seul'
        PATCH = 'PATCH', 'Écusson / Logo'

    club_id = models.BigIntegerField(db_index=True, help_text="ID du club propriétaire")
    name = models.CharField(max_length=100, help_text="Nom de l'option (ex: Flocage Officiel Ligue 1)")
    print_type = models.CharField(max_length=50, choices=PrintType.choices, default=PrintType.NAME_NUMBER)
    extra_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Prix additionnel du flocage")
    allowed_locations = models.JSONField(default=list, blank=True, help_text="Emplacements autorisés ex: ['BACK', 'CHEST']")
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'shop_custom_print_options'
        ordering = ['name']
        verbose_name = "Option de flocage"
        verbose_name_plural = "Options de flocage"

    def __str__(self) -> str:
        return f"{self.name} (+{self.extra_price} €)"
