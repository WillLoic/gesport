"""AppConfig pour l'application campaigns (Emailing, SMS & WhatsApp)."""

from django.apps import AppConfig


class CampaignsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.campaigns'
    verbose_name = 'Campagnes Marketing (Email, SMS, WhatsApp)'
