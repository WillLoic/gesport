from rest_framework import serializers
from apps.inventory.models import StorageLocation, EquipmentItem


class StorageLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = StorageLocation
        fields = ['id', 'name', 'building', 'description']


class EquipmentItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = EquipmentItem
        fields = [
            'id', 'name', 'category', 'quantity_in_stock',
            'min_stock_threshold', 'status', 'location',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']
