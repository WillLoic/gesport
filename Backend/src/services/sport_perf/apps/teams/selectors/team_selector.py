from django.db.models import QuerySet
from apps.teams.models.team import Team

def get_team_by_id(team_id: int) -> Team:
    return Team.objects.prefetch_related('players__member').get(pk=team_id)

def list_club_teams(club_id: int, *, sport_type: str = None) -> QuerySet:
    qs = Team.objects.filter(club_id=club_id)
    if sport_type:
        qs = qs.filter(sport_type=sport_type)
    return qs.order_by('name')
