from rest_framework import serializers
from apps.competitions.models.match import MatchEvent, Callup, MatchPlayerStats
from apps.membres.serializers.member_serializer import MemberSerializer

class CallupSerializer(serializers.ModelSerializer):
    member_detail = MemberSerializer(source='member', read_only=True)

    class Meta:
        model = Callup
        fields = ['id', 'match', 'member', 'member_detail', 'status', 'notes', 'created_at']

class MatchPlayerStatsSerializer(serializers.ModelSerializer):
    member_detail = MemberSerializer(source='member', read_only=True)

    class Meta:
        model = MatchPlayerStats
        fields = ['id', 'match', 'member', 'member_detail', 'points', 'assists', 'rebounds', 'fouls', 'rating', 'is_mvp']

class MatchEventSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source='team.name', read_only=True)
    callups = CallupSerializer(many=True, read_only=True)
    player_stats = MatchPlayerStatsSerializer(many=True, read_only=True)

    class Meta:
        model = MatchEvent
        fields = [
            'id', 'team', 'team_name', 'opponent_name', 'is_home', 'match_date',
            'venue', 'score_home', 'score_away', 'status', 'callups', 'player_stats', 'created_at',
        ]
