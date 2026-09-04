"""Tâches Celery pour l'exécution asynchrone des campagnes marketing."""

import logging
from celery import shared_task
from apps.campaigns.services.campaign_engine import execute_campaign

logger = logging.getLogger(__name__)


@shared_task(name="apps.campaigns.tasks.dispatch_campaign_task")
def dispatch_campaign_task(campaign_id: int):
    """Tâche Celery d'expédition d'une campagne en arrière-plan."""
    logger.info(f"Lancement de la tâche Celery pour la campagne #{campaign_id}")
    try:
        campaign = execute_campaign(campaign_id)
        return f"Campagne #{campaign_id} exécutée avec succès ({campaign.status})."
    except Exception as e:
        logger.exception(f"Erreur lors de l'exécution de la campagne #{campaign_id}")
        raise e
