"""
Sérialiseurs pour l'application tax_receipts — Reçus Fiscaux Cerfa (2041-RD / 11580*03).
"""

from rest_framework import serializers
from apps.tax_receipts.models.receipt import Donor, TaxReceipt


class DonorSerializer(serializers.ModelSerializer):
    donor_type_display = serializers.CharField(source='get_donor_type_display', read_only=True)

    class Meta:
        model = Donor
        fields = [
            'id', 'club_id', 'donor_type', 'donor_type_display',
            'first_name', 'last_name', 'email', 'address', 'tax_id', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class TaxReceiptSerializer(serializers.ModelSerializer):
    donor_detail = DonorSerializer(source='donor', read_only=True)
    donation_type_display = serializers.CharField(source='get_donation_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = TaxReceipt
        fields = [
            'id', 'club_id', 'receipt_number', 'donor', 'donor_detail',
            'donation_date', 'donation_type', 'donation_type_display',
            'amount', 'description', 'status', 'status_display', 'issued_at'
        ]
        read_only_fields = ['id', 'receipt_number', 'issued_at']

