from django.urls import path
from apps.academy.views.student_view import AcademyStudentListCreateView, AcademyStudentDetailView

urlpatterns = [
    path('students/', AcademyStudentListCreateView.as_view(), name='academy-students'),
    path('students/<int:pk>/', AcademyStudentDetailView.as_view(), name='academy-student-detail'),
]

