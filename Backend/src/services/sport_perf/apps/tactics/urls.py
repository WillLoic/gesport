from django.urls import path
from apps.tactics.views.tactics_view import (
    TacticalBoardListCreateView, TacticalBoardDetailView,
    TrainingExerciseListCreateView, TrainingExerciseDetailView,
    TrainingSessionListCreateView, TrainingSessionDetailView
)

urlpatterns = [
    path('boards/', TacticalBoardListCreateView.as_view(), name='tactics-boards-list'),
    path('boards/<int:pk>/', TacticalBoardDetailView.as_view(), name='tactics-boards-detail'),
    path('exercises/', TrainingExerciseListCreateView.as_view(), name='tactics-exercises-list'),
    path('exercises/<int:pk>/', TrainingExerciseDetailView.as_view(), name='tactics-exercises-detail'),
    path('sessions/', TrainingSessionListCreateView.as_view(), name='tactics-sessions-list'),
    path('sessions/<int:pk>/', TrainingSessionDetailView.as_view(), name='tactics-sessions-detail'),
]
