from django.db.models import QuerySet
from apps.membres.models.member import Member

def get_member_by_id(member_id: int) -> Member:
    return Member.objects.get(pk=member_id)

def list_club_members(club_id: int, *, category: str = None, license_status: str = None) -> QuerySet:
    qs = Member.objects.filter(club_id=club_id)
    if category:
        qs = qs.filter(category=category)
    if license_status:
        qs = qs.filter(license_status=license_status)
    return qs.order_by('last_name', 'first_name')
