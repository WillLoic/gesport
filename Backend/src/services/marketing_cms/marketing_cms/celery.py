"""
Configuration Celery pour le microservice marketing_cms.

Permet l'exécution asynchrone des campagnes Email/SMS (Brevo) et WhatsApp (Geskap).
"""

import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'marketing_cms.settings')

app = Celery('marketing_cms')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
