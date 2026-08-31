from django.urls import path
from apps.medical.views.medical_view import MedicalRecordListCreateView, MedicalRecordDetailView

urlpatterns = [
    path('records/', MedicalRecordListCreateView.as_view(), name='medical-records-list-create'),
    path('records/<int:pk>/', MedicalRecordDetailView.as_view(), name='medical-records-detail'),
]
