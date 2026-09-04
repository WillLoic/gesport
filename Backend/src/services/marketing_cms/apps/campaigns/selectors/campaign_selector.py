"""Selectors de données pour l'application campaigns."""

from apps.campaigns.models.audience import AudienceSegment
from apps.campaigns.models.campaign import Campaign
from apps.campaigns.models.recipient_log import CampaignRecipientLog


def list_audience_segments_by_club(club_id: int):
    """Retourne la liste des segments d'audience d'un club."""
    return AudienceSegment.objects.filter(club_id=club_id)


def get_audience_segment_by_id(segment_id: int) -> AudienceSegment:
    """Récupère un segment d'audience par ID."""
    return AudienceSegment.objects.get(pk=segment_id)


def list_campaigns_by_club(club_id: int, status: str = None, channel: str = None):
    """Liste les campagnes d'un club avec filtres optionnels."""
    qs = Campaign.objects.filter(club_id=club_id)
    if status:
        qs = qs.filter(status=status)
    if channel:
        qs = qs.filter(channel=channel)
    return qs.select_related('segment')


def get_campaign_by_id(campaign_id: int) -> Campaign:
    """Récupère une campagne par son ID."""
    return Campaign.objects.select_related('segment').get(pk=campaign_id)


def list_recipient_logs_for_campaign(campaign_id: int):
    """Liste les logs d'envoi individuels d'une campagne."""
    return CampaignRecipientLog.objects.filter(campaign_id=campaign_id)
