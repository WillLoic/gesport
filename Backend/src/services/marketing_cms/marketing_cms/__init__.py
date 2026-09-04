"""Package marketing_cms — charge Celery au démarrage du projet."""

from .celery import app as celery_app

__all__ = ['celery_app']
