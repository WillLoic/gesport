"""
Modèle AcademyStudent — Suivi scolaire, tuteurs et bilans de formation des jeunes athlètes.
"""

from django.db import models
from apps.membres.models.member import Member


class AcademyStudent(models.Model):
    """Suivi scolaire et de formation d'un jeune membre de l'Académie."""

    member = models.OneToOneField(Member, on_delete=models.CASCADE, related_name='academy_profile', verbose_name="Membre / Joueur")
    school_name = models.CharField(max_length=150, verbose_name="Établissement scolaire / Lycée")
    grade_level = models.CharField(max_length=50, verbose_name="Classe / Niveau (ex: 3ème, Terminale)")
    academic_gpa = models.FloatField(default=14.0, verbose_name="Moyenne générale (/20)")

    tutor_name = models.CharField(max_length=100, blank=True, default='', verbose_name="Nom du tuteur / Référent")
    tutor_phone = models.CharField(max_length=20, blank=True, default='', verbose_name="Téléphone du tuteur")

    observations = models.TextField(blank=True, default='', verbose_name="Bilan comportemental & sportif")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sport_academy_students'
        verbose_name = 'Élève Académie'
        verbose_name_plural = 'Élèves Académie'

    def __str__(self) -> str:
        return f"{self.member.full_name} - {self.grade_level} ({self.school_name})"
