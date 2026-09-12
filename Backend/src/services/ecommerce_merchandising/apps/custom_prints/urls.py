"""Routes URL pour les options de flocage."""

from django.urls import path
from apps.custom_prints.views import (
    CustomPrintOptionListCreateView,
    CustomPrintOptionDetailView,
)

urlpatterns = [
    path('options/', CustomPrintOptionListCreateView.as_view(), name='custom-print-options-list-create'),
    path('options/<int:pk>/', CustomPrintOptionDetailView.as_view(), name='custom-print-option-detail'),
]
