from django.urls import path
from apps.tactics.views.tactics_view import TacticalBoardListCreateView, TrainingExerciseListCreateView, TrainingSessionListCreateView

urlpatterns = [
    path('boards/', TacticalBoardListCreateView.as_view(), name='tactics-boards'),
    path('exercises/', TrainingExerciseListCreateView.as_view(), name='tactics-exercises'),
    path('sessions/', TrainingSessionListCreateView.as_view(), name='tactics-sessions'),
]
