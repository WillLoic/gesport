from django.urls import path
from apps.academy.views.student_view import AcademyStudentListCreateView

urlpatterns = [
    path('students/', AcademyStudentListCreateView.as_view(), name='academy-students'),
]
