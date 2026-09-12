"""AppConfig pour l'application custom_prints."""

from django.apps import AppConfig


class CustomPrintsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.custom_prints'
    verbose_name = 'Options & Flocages Personnalisés'
