from rest_framework import serializers
from apps.fleet.models import Vehicle, VehicleReservation


class VehicleReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleReservation
        fields = [
            'id', 'vehicle', 'driver_name', 'driver_email',
            'purpose', 'start_time', 'end_time', 'status',
            'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class VehicleSerializer(serializers.ModelSerializer):
    reservations = VehicleReservationSerializer(many=True, read_only=True)

    class Meta:
        model = Vehicle
        fields = [
            'id', 'registration_number', 'brand_model', 'seating_capacity',
            'fuel_type', 'current_mileage', 'status', 'created_at',
            'updated_at', 'reservations'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
