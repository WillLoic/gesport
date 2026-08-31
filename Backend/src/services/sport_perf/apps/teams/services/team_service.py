from apps.teams.models.team import Team, TeamPlayer
from apps.membres.models.member import Member

def create_team(*, club_id: int, name: str, **kwargs) -> Team:
    return Team.objects.create(club_id=club_id, name=name, **kwargs)

def add_player_to_team(*, team: Team, member_id: int, jersey_number: int = None, position: str = '') -> TeamPlayer:
    member = Member.objects.get(pk=member_id)
    tp, _ = TeamPlayer.objects.update_or_create(
        team=team,
        member=member,
        defaults={'jersey_number': jersey_number, 'position': position}
    )
    return tp

def remove_player_from_team(*, team: Team, member_id: int) -> None:
    TeamPlayer.objects.filter(team=team, member_id=member_id).delete()
