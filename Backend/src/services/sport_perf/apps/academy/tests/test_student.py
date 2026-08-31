from django.test import TestCase
from apps.membres.services.member_service import create_member
from apps.academy.services.student_service import create_or_update_student

class AcademyTestCase(TestCase):
    def test_student_profile(self):
        m = create_member(club_id=1, first_name="Julien", last_name="Petit", email="julien@gesport.fr")
        student = create_or_update_student(member_id=m.id, school_name="Lycée Lakanal", grade_level="Terminales", academic_gpa=15.5)
        self.assertEqual(student.academic_gpa, 15.5)
        self.assertEqual(student.school_name, "Lycée Lakanal")
