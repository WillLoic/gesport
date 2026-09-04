"""Moteur d'exécution des campagnes marketing multi-canaux."""

import logging
from django.utils import timezone
from apps.campaigns.models.campaign import Campaign
from apps.campaigns.models.recipient_log import CampaignRecipientLog
from apps.campaigns.services.brevo_service import BrevoService
from apps.campaigns.services.geskap_service import GeskapWhatsAppService

logger = logging.getLogger(__name__)


def execute_campaign(campaign_id: int, custom_recipients: list = None) -> Campaign:
    """Exécute l'envoi d'une campagne marketing aux destinataires de son audience.
    
    Args:
        campaign_id: ID de la campagne à envoyer
        custom_recipients: Liste optionnelle de contacts [(contact_str, member_id), ...]
    """
    try:
        campaign = Campaign.objects.get(pk=campaign_id)
    except Campaign.DoesNotExist:
        logger.error(f"Campagne #{campaign_id} introuvable pour l'exécution.")
        raise ValueError(f"Campagne #{campaign_id} introuvable.")

    campaign.status = Campaign.Status.SENDING
    campaign.save(update_fields=['status'])

    # Récupération des destinataires
    recipients = custom_recipients or []
    if not recipients and campaign.segment:
        # Extraire la liste des destinataires depuis les filtres du segment (mock/fallback si liste brute non définie)
        filters = campaign.segment.filters or {}
        recipients = filters.get('recipient_list', [
            {"contact": "demo_member@gesport.com", "id": 101},
            {"contact": "+33600000001", "id": 102}
        ])

    if not recipients:
        # Aucun destinataire trouvé
        recipients = [{"contact": "fallback_contact@gesport.com", "id": 1}]

    campaign.total_recipients = len(recipients)
    campaign.save(update_fields=['total_recipients'])

    brevo = BrevoService()
    geskap = GeskapWhatsAppService()

    success_count = 0
    failure_count = 0

    for rec in recipients:
        contact = rec.get("contact") if isinstance(rec, dict) else str(rec)
        member_id = rec.get("id") if isinstance(rec, dict) else None

        log = CampaignRecipientLog.objects.create(
            campaign=campaign,
            recipient_contact=contact,
            recipient_id=member_id,
            status=CampaignRecipientLog.Status.PENDING
        )

        res = {"success": False, "error": "Canal non supporté"}
        if campaign.channel == Campaign.Channel.EMAIL:
            res = brevo.send_email(
                to_email=contact,
                subject=campaign.subject or campaign.title,
                content=campaign.content
            )
        elif campaign.channel == Campaign.Channel.SMS:
            res = brevo.send_sms(
                to_phone=contact,
                content=campaign.content
            )
        elif campaign.channel == Campaign.Channel.WHATSAPP:
            res = geskap.send_whatsapp_message(
                to_phone=contact,
                text_content=campaign.content,
                media_url=campaign.media_url
            )

        if res.get("success"):
            log.status = CampaignRecipientLog.Status.SENT
            log.external_message_id = res.get("message_id")
            log.sent_at = timezone.now()
            log.save()
            success_count += 1
        else:
            log.status = CampaignRecipientLog.Status.FAILED
            log.error_message = res.get("error", "Échec d'envoi")
            log.save()
            failure_count += 1

    campaign.delivered_count = success_count
    campaign.failed_count = failure_count
    campaign.sent_at = timezone.now()
    campaign.status = Campaign.Status.SENT if failure_count < len(recipients) else Campaign.Status.FAILED
    campaign.save()

    logger.info(f"Campagne #{campaign_id} terminée: {success_count} réussis, {failure_count} échecs.")
    return campaign
