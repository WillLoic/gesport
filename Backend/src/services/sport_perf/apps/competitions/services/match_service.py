from apps.competitions.models.match import MatchEvent, Callup, MatchPlayerStats

def create_match(*, team_id: int, opponent_name: str, match_date, **kwargs) -> MatchEvent:
    return MatchEvent.objects.create(team_id=team_id, opponent_name=opponent_name, match_date=match_date, **kwargs)

def add_callup(*, match: MatchEvent, member_id: int, status: str = 'Convoqué', notes: str = '') -> Callup:
    c, _ = Callup.objects.update_or_create(match=match, member_id=member_id, defaults={'status': status, 'notes': notes})
    return c

def update_match_stats(*, match: MatchEvent, member_id: int, **stats) -> MatchPlayerStats:
    mps, _ = MatchPlayerStats.objects.update_or_create(match=match, member_id=member_id, defaults=stats)
    return mps
