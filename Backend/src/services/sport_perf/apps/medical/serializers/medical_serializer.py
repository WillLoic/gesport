from rest_framework import serializers
from apps.medical.models.medical import MedicalRecord
from apps.membres.models.member import Member
from apps.membres.serializers.member_serializer import MemberSerializer

class MedicalRecordSerializer(serializers.ModelSerializer):
    member_detail = MemberSerializer(source='member', read_only=True)
    member = serializers.PrimaryKeyRelatedField(
        queryset=Member.objects.all(),
        required=False,
        allow_null=True
    )
    member_id = serializers.IntegerField(required=False, allow_null=True, write_only=True)

    class Meta:
        model = MedicalRecord
        fields = [
            'id', 'member', 'member_id', 'member_detail', 'injury_type', 'body_part',
            'injury_date', 'expected_return_date', 'status', 'doctor_notes',
            'return_clearance_certified', 'created_at',
        ]
        extra_kwargs = {
            'created_at': {'read_only': True},
        }
