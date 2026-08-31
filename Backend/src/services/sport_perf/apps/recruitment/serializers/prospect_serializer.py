from rest_framework import serializers
from apps.recruitment.models.prospect import TalentProspect

class TalentProspectSerializer(serializers.ModelSerializer):
    class Meta:
        model = TalentProspect
        fields = [
            'id', 'club_id', 'first_name', 'last_name', 'birth_year', 'sport_type',
            'position', 'current_club', 'overall_rating', 'radar_scores_json',
            'status', 'scout_notes', 'created_at',
        ]
