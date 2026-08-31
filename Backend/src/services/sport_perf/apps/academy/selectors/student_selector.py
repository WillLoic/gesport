from django.db.models import QuerySet
from apps.academy.models.student import AcademyStudent

def list_academy_students(club_id: int) -> QuerySet:
    return AcademyStudent.objects.filter(member__club_id=club_id).select_related('member').order_by('member__last_name')
