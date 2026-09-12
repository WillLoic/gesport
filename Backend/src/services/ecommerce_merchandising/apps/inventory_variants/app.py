"""AppConfig pour l'application inventory_variants."""

from django.apps import AppConfig


class InventoryVariantsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.inventory_variants'
    verbose_name = 'Inventaire & Variantes de Produit'
