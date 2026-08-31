from apps.academy.models.student import AcademyStudent

def create_or_update_student(*, member_id: int, school_name: str, grade_level: str, **kwargs) -> AcademyStudent:
    student, _ = AcademyStudent.objects.update_or_create(
        member_id=member_id,
        defaults={'school_name': school_name, 'grade_level': grade_level, **kwargs}
    )
    return student
