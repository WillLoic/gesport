from rest_framework import serializers
from apps.teams.models.team import Team, TeamPlayer
from apps.membres.serializers.member_serializer import MemberSerializer

class TeamPlayerSerializer(serializers.ModelSerializer):
    member_detail = MemberSerializer(source='member', read_only=True)

    class Meta:
        model = TeamPlayer
        fields = ['id', 'jersey_number', 'position', 'member', 'member_detail', 'joined_at']

class TeamSerializer(serializers.ModelSerializer):
    players = TeamPlayerSerializer(many=True, read_only=True)
    players_count = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = [
            'id', 'club_id', 'name', 'sport_type', 'category',
            'head_coach_name', 'head_coach_id', 'players', 'players_count', 'created_at',
        ]

    def get_players_count(self, obj: Team) -> int:
        return obj.players.count()

class AddPlayerToTeamSerializer(serializers.Serializer):
    member_id = serializers.IntegerField(required=True)
    jersey_number = serializers.IntegerField(required=False, allow_null=True)
    position = serializers.CharField(required=False, allow_blank=True)
