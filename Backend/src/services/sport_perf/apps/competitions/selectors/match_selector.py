from django.db.models import QuerySet
from apps.competitions.models.match import MatchEvent

def get_match_by_id(match_id: int) -> MatchEvent:
    return MatchEvent.objects.prefetch_related('callups__member', 'player_stats__member').get(pk=match_id)

def list_team_matches(team_id: int) -> QuerySet:
    return MatchEvent.objects.filter(team_id=team_id).order_by('-match_date')
