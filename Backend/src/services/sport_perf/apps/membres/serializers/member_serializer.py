from rest_framework import serializers
# pyrefly: ignore [missing-import]
from apps.membres.models.member import Member

class MemberSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Member
        fields = [
            'id', 'club_id', 'user_id', 'first_name', 'last_name', 'full_name',
            'email', 'phone', 'gender', 'birth_date', 'sport_type', 'category',
            'license_number', 'license_status', 'medical_cert_valid', 'medical_cert_date',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

class MemberCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = [
            'club_id', 'user_id', 'first_name', 'last_name',
            'email', 'phone', 'gender', 'birth_date', 'sport_type', 'category',
            'license_number', 'license_status', 'medical_cert_valid', 'medical_cert_date',
        ]
