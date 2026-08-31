from django.db.models import QuerySet
from apps.recruitment.models.prospect import TalentProspect

def list_prospects(club_id: int, *, status: str = None) -> QuerySet:
    qs = TalentProspect.objects.filter(club_id=club_id)
    if status:
        qs = qs.filter(status=status)
    return qs.order_by('-overall_rating', 'last_name')
