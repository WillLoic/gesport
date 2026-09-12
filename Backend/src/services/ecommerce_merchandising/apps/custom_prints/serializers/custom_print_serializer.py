"""Serializers DRF pour les options et détails de flocage."""

from rest_framework import serializers
from apps.custom_prints.models.option import CustomPrintOption
from apps.custom_prints.models.print_detail import CustomPrintDetail


class CustomPrintOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomPrintOption
        fields = [
            'id', 'club_id', 'name', 'print_type', 'extra_price',
            'allowed_locations', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CustomPrintDetailSerializer(serializers.ModelSerializer):
    option_name = serializers.ReadOnlyField(source='option.name', default="")

    class Meta:
        model = CustomPrintDetail
        fields = [
            'id', 'option', 'option_name', 'custom_name', 'custom_number',
            'location', 'font_style', 'color', 'extra_price', 'created_at'
        ]
        read_only_fields = ['id', 'extra_price', 'created_at']
