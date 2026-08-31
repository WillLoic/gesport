from django.urls import path
from apps.recruitment.views.prospect_view import ProspectListCreateView, ProspectDetailView

urlpatterns = [
    path('prospects/', ProspectListCreateView.as_view(), name='recruitment-prospects-list-create'),
    path('prospects/<int:pk>/', ProspectDetailView.as_view(), name='recruitment-prospects-detail'),
]
