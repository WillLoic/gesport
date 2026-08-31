from rest_framework import serializers
from apps.maintenance.models import MaintenanceRecord


class MaintenanceRecordSerializer(serializers.ModelSerializer):
    maintenance_type_display = serializers.CharField(source='get_maintenance_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = MaintenanceRecord
        fields = [
            'id', 'vehicle', 'equipment', 'maintenance_type', 'maintenance_type_display',
            'cost', 'performed_date', 'next_due_date', 'provider',
            'status', 'status_display', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

