"""Vues API pour l'application campaigns (Segments, Campagnes, Dispatch, Stats)."""

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.campaigns.models.campaign import Campaign
from apps.campaigns.models.audience import AudienceSegment
from apps.campaigns.selectors.campaign_selector import (
    list_audience_segments_by_club, get_audience_segment_by_id,
    list_campaigns_by_club, get_campaign_by_id, list_recipient_logs_for_campaign,
)
from apps.campaigns.serializers.campaign_serializer import (
    AudienceSegmentSerializer, CampaignSerializer, CampaignRecipientLogSerializer,
)
from apps.campaigns.services.campaign_engine import execute_campaign
from apps.campaigns.tasks import dispatch_campaign_task


# ── Segments d'Audience ─────────────────────────────────────────────

class AudienceSegmentListCreateView(APIView):
    """GET : lister les segments d'un club. POST : créer un segment."""
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        club_id = request.query_params.get('club_id', 1)
        segments = list_audience_segments_by_club(int(club_id))
        return Response(AudienceSegmentSerializer(segments, many=True).data)

    def post(self, request: Request) -> Response:
        serializer = AudienceSegmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        segment = serializer.save()
        return Response(AudienceSegmentSerializer(segment).data, status=status.HTTP_201_CREATED)


class AudienceSegmentDetailView(APIView):
    """GET / PUT / DELETE un segment d'audience."""
    permission_classes = [AllowAny]

    def get(self, request: Request, pk: int) -> Response:
        try:
            segment = get_audience_segment_by_id(pk)
        except AudienceSegment.DoesNotExist:
            return Response({"detail": "Segment introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(AudienceSegmentSerializer(segment).data)

    def put(self, request: Request, pk: int) -> Response:
        try:
            segment = get_audience_segment_by_id(pk)
        except AudienceSegment.DoesNotExist:
            return Response({"detail": "Segment introuvable."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = AudienceSegmentSerializer(segment, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response(AudienceSegmentSerializer(updated).data)

    def delete(self, request: Request, pk: int) -> Response:
        try:
            segment = get_audience_segment_by_id(pk)
            segment.delete()
        except AudienceSegment.DoesNotExist:
            return Response({"detail": "Segment introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── Campagnes Marketing ────────────────────────────────────────────

class CampaignListCreateView(APIView):
    """GET : lister les campagnes d'un club. POST : créer une campagne."""
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        club_id = request.query_params.get('club_id', 1)
        camp_status = request.query_params.get('status')
        channel = request.query_params.get('channel')
        campaigns = list_campaigns_by_club(int(club_id), status=camp_status, channel=channel)
        return Response(CampaignSerializer(campaigns, many=True).data)

    def post(self, request: Request) -> Response:
        serializer = CampaignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        campaign = serializer.save()
        return Response(CampaignSerializer(campaign).data, status=status.HTTP_201_CREATED)


class CampaignDetailView(APIView):
    """GET / PUT / DELETE une campagne."""
    permission_classes = [AllowAny]

    def get(self, request: Request, pk: int) -> Response:
        try:
            campaign = get_campaign_by_id(pk)
        except Campaign.DoesNotExist:
            return Response({"detail": "Campagne introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(CampaignSerializer(campaign).data)

    def put(self, request: Request, pk: int) -> Response:
        try:
            campaign = get_campaign_by_id(pk)
        except Campaign.DoesNotExist:
            return Response({"detail": "Campagne introuvable."}, status=status.HTTP_404_NOT_FOUND)

        if campaign.status in [Campaign.Status.SENDING, Campaign.Status.SENT]:
            return Response(
                {"detail": "Impossible de modifier une campagne déjà envoyée ou en cours d'envoi."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = CampaignSerializer(campaign, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response(CampaignSerializer(updated).data)

    def delete(self, request: Request, pk: int) -> Response:
        try:
            campaign = get_campaign_by_id(pk)
            campaign.delete()
        except Campaign.DoesNotExist:
            return Response({"detail": "Campagne introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


class CampaignDispatchView(APIView):
    """POST : déclencher l'envoi immédiat ou synchrone/asynchrone d'une campagne."""
    permission_classes = [AllowAny]

    def post(self, request: Request, pk: int) -> Response:
        try:
            campaign = get_campaign_by_id(pk)
        except Campaign.DoesNotExist:
            return Response({"detail": "Campagne introuvable."}, status=status.HTTP_404_NOT_FOUND)

        if campaign.status in [Campaign.Status.SENDING, Campaign.Status.SENT]:
            return Response(
                {"detail": f"La campagne est déjà au statut '{campaign.status}'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        async_mode = request.data.get('async', True)
        custom_recipients = request.data.get('recipients', None)

        if async_mode and not custom_recipients:
            # Lancement asynchrone via Celery
            dispatch_campaign_task.delay(campaign.id)
            campaign.status = Campaign.Status.SCHEDULED
            campaign.save(update_fields=['status'])
            return Response({
                "detail": "Campagne programmée pour expédition asynchrone.",
                "campaign": CampaignSerializer(campaign).data
            })
        else:
            # Exécution synchrone immédiate (direct/tests)
            executed_camp = execute_campaign(campaign.id, custom_recipients=custom_recipients)
            return Response({
                "detail": "Campagne expédiée avec succès.",
                "campaign": CampaignSerializer(executed_camp).data
            })


class CampaignStatsView(APIView):
    """GET : consulter les statistiques et logs détaillés d'une campagne."""
    permission_classes = [AllowAny]

    def get(self, request: Request, pk: int) -> Response:
        try:
            campaign = get_campaign_by_id(pk)
        except Campaign.DoesNotExist:
            return Response({"detail": "Campagne introuvable."}, status=status.HTTP_404_NOT_FOUND)

        logs = list_recipient_logs_for_campaign(pk)
        return Response({
            "campaign": CampaignSerializer(campaign).data,
            "logs": CampaignRecipientLogSerializer(logs, many=True).data
        })
