from rest_framework import serializers
# pyrefly: ignore [missing-import]
from apps.membres.models.member import Member

class MemberSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    teams = serializers.SerializerMethodField()

    class Meta:
        model = Member
        fields = [
            'id', 'club_id', 'user_id', 'first_name', 'last_name', 'full_name',
            'email', 'phone', 'gender', 'birth_date', 'sport_type', 'category',
            'license_number', 'license_status', 'medical_cert_valid', 'medical_cert_date',
            'jersey_number', 'position', 'gross_monthly_salary', 'daily_salary',
            'cotisation_amount', 'cotisation_paid', 'teams',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_teams(self, obj: Member):
        return [
            {
                'team_id': tp.team_id,
                'team_name': tp.team.name,
                'jersey_number': tp.jersey_number,
                'position': tp.position
            }
            for tp in obj.teams.select_related('team').all()
        ]

class MemberCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = [
            'club_id', 'user_id', 'first_name', 'last_name',
            'email', 'phone', 'gender', 'birth_date', 'sport_type', 'category',
            'license_number', 'license_status', 'medical_cert_valid', 'medical_cert_date',
            'jersey_number', 'position', 'gross_monthly_salary', 'daily_salary',
            'cotisation_amount', 'cotisation_paid',
        ]
