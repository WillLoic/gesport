from rest_framework import serializers
from apps.medical.models.medical import MedicalRecord
from apps.membres.serializers.member_serializer import MemberSerializer

class MedicalRecordSerializer(serializers.ModelSerializer):
    member_detail = MemberSerializer(source='member', read_only=True)

    class Meta:
        model = MedicalRecord
        fields = [
            'id', 'member', 'member_detail', 'injury_type', 'body_part',
            'injury_date', 'expected_return_date', 'status', 'doctor_notes',
            'return_clearance_certified', 'created_at',
        ]
