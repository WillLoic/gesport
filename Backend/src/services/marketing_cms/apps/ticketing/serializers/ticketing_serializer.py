"""Serializers DRF pour les événements, catégories et billets."""

from rest_framework import serializers
from apps.ticketing.models.event import TicketEvent
from apps.ticketing.models.category import TicketCategory
from apps.ticketing.models.ticket import Ticket


class TicketCategorySerializer(serializers.ModelSerializer):
    available_tickets = serializers.ReadOnlyField()

    class Meta:
        model = TicketCategory
        fields = [
            'id', 'event', 'name', 'description', 'price', 'currency',
            'total_capacity', 'sold_count', 'available_tickets', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'sold_count', 'available_tickets', 'created_at', 'updated_at']


class TicketEventSerializer(serializers.ModelSerializer):
    categories = TicketCategorySerializer(many=True, read_only=True)

    class Meta:
        model = TicketEvent
        fields = [
            'id', 'club_id', 'title', 'slug', 'event_type', 'description',
            'location', 'start_date', 'end_date', 'cover_image_url', 'status',
            'categories', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class TicketSerializer(serializers.ModelSerializer):
    event_title = serializers.ReadOnlyField(source='event.title')
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = Ticket
        fields = [
            'id', 'ticket_code', 'event', 'event_title', 'category', 'category_name',
            'buyer_name', 'buyer_email', 'buyer_phone', 'price_paid', 'status',
            'qr_code_data', 'checked_in_at', 'checked_in_by_id', 'created_at'
        ]
        read_only_fields = ['id', 'ticket_code', 'price_paid', 'status', 'qr_code_data', 'checked_in_at', 'created_at']


class TicketPurchaseRequestSerializer(serializers.Serializer):
    event_id = serializers.IntegerField()
    category_id = serializers.IntegerField()
    buyer_name = serializers.CharField(max_length=255)
    buyer_email = serializers.EmailField()
    buyer_phone = serializers.CharField(max_length=50, required=False, allow_blank=True, default="")


class TicketScanRequestSerializer(serializers.Serializer):
    ticket_code = serializers.CharField(max_length=64)
    checked_in_by_id = serializers.IntegerField(required=False, allow_null=True)
