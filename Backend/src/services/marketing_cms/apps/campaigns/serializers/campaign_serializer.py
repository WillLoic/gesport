"""Serializers DRF pour les campagnes marketing, audiences et logs."""

from rest_framework import serializers
from apps.campaigns.models.audience import AudienceSegment
from apps.campaigns.models.campaign import Campaign
from apps.campaigns.models.recipient_log import CampaignRecipientLog


class AudienceSegmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AudienceSegment
        fields = [
            'id', 'club_id', 'name', 'description', 'filters',
            'estimated_size', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CampaignRecipientLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignRecipientLog
        fields = [
            'id', 'campaign', 'recipient_contact', 'recipient_id',
            'status', 'external_message_id', 'error_message', 'sent_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class CampaignSerializer(serializers.ModelSerializer):
    segment_details = AudienceSegmentSerializer(source='segment', read_only=True)

    class Meta:
        model = Campaign
        fields = [
            'id', 'club_id', 'title', 'channel', 'status', 'segment', 'segment_details',
            'subject', 'content', 'media_url', 'scheduled_at', 'sent_at',
            'total_recipients', 'delivered_count', 'opened_count', 'clicked_count', 'failed_count',
            'created_by_id', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'status', 'sent_at', 'total_recipients', 'delivered_count',
            'opened_count', 'clicked_count', 'failed_count', 'created_at', 'updated_at'
        ]
