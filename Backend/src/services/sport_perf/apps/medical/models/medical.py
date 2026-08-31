"""
Modèle MedicalRecord — Suivi des blessures, soins kiné et autorisations de reprise.
"""

from django.db import models
from apps.membres.models.member import Member


class MedicalRecord(models.Model):
    """Registre des blessures et soins d'un joueur."""

    STATUS_CHOICES = [
        ('En soins', 'En soins'),
        ('Réathlétisation', 'Réathlétisation'),
        ('Apte', 'Apte'),
        ('Indisponible', 'Indisponible'),
    ]

    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='medical_records', verbose_name="Joueur")
    injury_type = models.CharField(max_length=150, verbose_name="Type de blessure (ex: Entorse, Élongation)")
    body_part = models.CharField(max_length=100, verbose_name="Partie du corps touchée (ex: Cheville droite)")
    injury_date = models.DateField(verbose_name="Date de la blessure")
    expected_return_date = models.DateField(null=True, blank=True, verbose_name="Date de retour estimée")
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='En soins')

    doctor_notes = models.TextField(blank=True, default='', verbose_name="Observations médecin / kiné")
    return_clearance_certified = models.BooleanField(default=False, verbose_name="Autorisation de reprise validée")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sport_medical_records'
        verbose_name = 'Dossier Médical'
        verbose_name_plural = 'Dossiers Médicaux'
        ordering = ['-injury_date']

    def __str__(self) -> str:
        return f"{self.member.full_name} - {self.injury_type} ({self.status})"
