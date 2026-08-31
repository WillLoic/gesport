"""
Sérialiseurs pour l'application sponsors — Partenariats B2B.
"""

from rest_framework import serializers
from apps.sponsors.models.sponsor import Sponsor, SponsorshipPack, SponsorshipContract


class SponsorSerializer(serializers.ModelSerializer):
    sponsor_type_display = serializers.CharField(source='get_sponsor_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Sponsor
        fields = [
            'id', 'club_id', 'company_name', 'sponsor_type', 'sponsor_type_display',
            'siret', 'contact_name', 'contact_email', 'contact_phone',
            'website', 'logo_url', 'status', 'status_display', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SponsorshipPackSerializer(serializers.ModelSerializer):
    class Meta:
        model = SponsorshipPack
        fields = ['id', 'club_id', 'name', 'price', 'description', 'benefits', 'is_active']
        read_only_fields = ['id']


class SponsorshipContractSerializer(serializers.ModelSerializer):
    sponsor_detail = SponsorSerializer(source='sponsor', read_only=True)
    pack_detail = SponsorshipPackSerializer(source='pack', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = SponsorshipContract
        fields = [
            'id', 'club_id', 'contract_number', 'sponsor', 'sponsor_detail',
            'pack', 'pack_detail', 'start_date', 'end_date', 'amount',
            'status', 'status_display', 'notes', 'invoice_id', 'tax_receipt_id', 'created_at'
        ]
        read_only_fields = ['id', 'contract_number', 'created_at']

