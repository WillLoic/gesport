from rest_framework import serializers
from apps.tactics.models.tactics import TacticalBoard, TrainingExercise, TrainingSession

class TacticalBoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = TacticalBoard
        fields = ['id', 'club_id', 'title', 'sport_type', 'system_name', 'lineup_json', 'notes', 'coach_id', 'created_at']

class TrainingExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingExercise
        fields = ['id', 'club_id', 'title', 'sport_type', 'category', 'duration_minutes', 'description', 'created_at']

class TrainingSessionSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source='team.name', read_only=True)
    exercises_detail = TrainingExerciseSerializer(source='exercises', many=True, read_only=True)

    class Meta:
        model = TrainingSession
        fields = ['id', 'team', 'team_name', 'title', 'session_date', 'duration_minutes', 'exercises', 'exercises_detail', 'attendance_count', 'created_at']
