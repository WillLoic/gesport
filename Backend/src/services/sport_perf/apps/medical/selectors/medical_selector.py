from django.db.models import QuerySet
from apps.medical.models.medical import MedicalRecord

def list_club_medical_records(club_id: int, *, status: str = None) -> QuerySet:
    qs = MedicalRecord.objects.filter(member__club_id=club_id).select_related('member')
    if status:
        qs = qs.filter(status=status)
    return qs.order_by('-injury_date')
