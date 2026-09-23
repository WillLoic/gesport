from apps.competitions.models.match import MatchEvent, Callup, MatchPlayerStats
from apps.teams.models.team import Team

def create_match(*, team: Team = None, team_id: int = None, opponent_name: str, match_date, **kwargs) -> MatchEvent:
    """Crée un match. Accepte soit un objet Team, soit un team_id."""
    if team is not None:
        return MatchEvent.objects.create(team=team, opponent_name=opponent_name, match_date=match_date, **kwargs)
    if team_id is not None:
        return MatchEvent.objects.create(team_id=team_id, opponent_name=opponent_name, match_date=match_date, **kwargs)
    raise ValueError("Vous devez fournir soit 'team' soit 'team_id'.")

def add_callup(*, match: MatchEvent, member_id: int, status: str = 'Convoqué', notes: str = '') -> Callup:
    c, _ = Callup.objects.update_or_create(match=match, member_id=member_id, defaults={'status': status, 'notes': notes})
    return c

def update_match_stats(*, match: MatchEvent, member_id: int, **stats) -> MatchPlayerStats:
    mps, _ = MatchPlayerStats.objects.update_or_create(match=match, member_id=member_id, defaults=stats)
    return mps
