from django.db import models
from apps.governance.models.assembly import GeneralAssembly


class ResolutionStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Brouillon'
    PASSED = 'PASSED', 'Adoptée'
    REJECTED = 'REJECTED', 'Rejetée'


class Resolution(models.Model):
    assembly = models.ForeignKey(
        GeneralAssembly,
        on_delete=models.CASCADE,
        related_name='resolutions'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    votes_for = models.PositiveIntegerField(default=0)
    votes_against = models.PositiveIntegerField(default=0)
    votes_abstain = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=20,
        choices=ResolutionStatus.choices,
        default=ResolutionStatus.DRAFT
    )

    def __str__(self):
        return f"Résolution: {self.title} ({self.status})"
