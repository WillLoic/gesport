from apps.academy.models.student import AcademyStudent
from apps.membres.models.member import Member

def create_or_update_student(*, student_id: int = None, member_id: int = None, school_name: str = '', grade_level: str = '', **kwargs) -> AcademyStudent:
    if student_id:
        student = AcademyStudent.objects.get(id=student_id)
        if member_id:
            student.member_id = member_id
        student.school_name = school_name
        student.grade_level = grade_level
        for k, v in kwargs.items():
            setattr(student, k, v)
        student.save()
        return student

    if not member_id:
        first_member = Member.objects.first()
        if first_member:
            member_id = first_member.id

    if member_id:
        student, _ = AcademyStudent.objects.update_or_create(
            member_id=member_id,
            defaults={'school_name': school_name, 'grade_level': grade_level, **kwargs}
        )
        return student

    raise ValueError("Un membre est requis pour créer un dossier Académie.")

def delete_student(*, student_id: int) -> None:
    AcademyStudent.objects.filter(id=student_id).delete()

