# pyrefly: ignore [missing-import]
from apps.membres.models.member import Member

def create_member(*, club_id: int, first_name: str, last_name: str, email: str, **kwargs) -> Member:
    return Member.objects.create(
        club_id=club_id,
        first_name=first_name,
        last_name=last_name,
        email=email,
        **kwargs
    )

def update_member(*, member: Member, **fields) -> Member:
    for field, value in fields.items():
        setattr(member, field, value)
    member.save(update_fields=list(fields.keys()))
    return member

def delete_member(*, member: Member) -> None:
    member.delete()
