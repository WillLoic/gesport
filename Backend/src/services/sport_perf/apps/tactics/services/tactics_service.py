from apps.tactics.models.tactics import TacticalBoard, TrainingExercise, TrainingSession

def create_tactical_board(*, club_id: int, title: str, system_name: str, **kwargs) -> TacticalBoard:
    return TacticalBoard.objects.create(club_id=club_id, title=title, system_name=system_name, **kwargs)

def create_training_exercise(*, club_id: int, title: str, **kwargs) -> TrainingExercise:
    return TrainingExercise.objects.create(club_id=club_id, title=title, **kwargs)

def create_training_session(*, team_id: int, title: str, session_date, **kwargs) -> TrainingSession:
    exercises = kwargs.pop('exercises', [])
    ts = TrainingSession.objects.create(team_id=team_id, title=title, session_date=session_date, **kwargs)
    if exercises:
        ts.exercises.set(exercises)
    return ts
