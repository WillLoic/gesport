"""Serializers pour l'application club."""

from rest_framework import serializers

# pyrefly: ignore [missing-import]
from apps.club.models.club import Club
# pyrefly: ignore [missing-import]
from apps.club.models.season import Season
# pyrefly: ignore [missing-import]
from apps.club.models.membership import UserClubMembership


class SeasonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Season
        fields = ['id', 'name', 'start_date', 'end_date', 'is_current', 'created_at']
        read_only_fields = ['id', 'created_at']


class ClubSerializer(serializers.ModelSerializer):
    """Serializer complet du club, avec la saison courante imbriquée."""
    current_season = serializers.SerializerMethodField()

    class Meta:
        model = Club
        fields = [
            'id', 'name', 'slug', 'short_name', 'logo',
            'primary_color', 'secondary_color',
            'address', 'city', 'postal_code', 'phone', 'email', 'website',
            'description', 'is_active', 'current_season', 'created_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at']

    def get_current_season(self, obj: Club):
        """Retourne la saison en cours du club, ou None s'il n'y en a pas."""
        try:
            season = obj.seasons.get(is_current=True)
            return SeasonSerializer(season).data
        except Season.DoesNotExist:
            return None


class ClubCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un nouveau club."""
    class Meta:
        model = Club
        fields = ['name', 'short_name', 'logo', 'primary_color', 'secondary_color',
                  'address', 'city', 'postal_code', 'phone', 'email', 'website', 'description']


class UserClubMembershipSerializer(serializers.ModelSerializer):
    """Serializer pour l'adhésion d'un utilisateur à un club."""
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_full_name = serializers.CharField(source='user.full_name', read_only=True)
    club_name = serializers.CharField(source='club.name', read_only=True)

    class Meta:
        model = UserClubMembership
        fields = ['id', 'user_email', 'user_full_name', 'club_name', 'is_active', 'joined_at']
        read_only_fields = ['id', 'joined_at']


class AddMemberSerializer(serializers.Serializer):
    """Valide l'ajout d'un utilisateur à un club."""
    user_email = serializers.EmailField(required=True)
