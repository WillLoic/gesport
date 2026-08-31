from django.db import models


class AssemblyType(models.TextChoices):
    ORDINARY = 'ORDINARY', 'Ordinaire'
    EXTRAORDINARY = 'EXTRAORDINARY', 'Extraordinaire'
    SPECIAL = 'SPECIAL', 'Spéciale'


class AssemblyStatus(models.TextChoices):
    CONVOKED = 'CONVOKED', 'Convoquée'
    IN_PROGRESS = 'IN_PROGRESS', 'En cours'
    COMPLETED = 'COMPLETED', 'Terminée'
    CANCELLED = 'CANCELLED', 'Annulée'


class GeneralAssembly(models.Model):
    title = models.CharField(max_length=255)
    assembly_type = models.CharField(
        max_length=20,
        choices=AssemblyType.choices,
        default=AssemblyType.ORDINARY
    )
    status = models.CharField(
        max_length=20,
        choices=AssemblyStatus.choices,
        default=AssemblyStatus.CONVOKED
    )
    scheduled_at = models.DateTimeField()
    location = models.CharField(max_length=255, default='Siège social')
    quorum_reached = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-scheduled_at']

    def __str__(self):
        return f"{self.title} ({self.assembly_type}) - {self.status}"


class AssemblyConvocation(models.Model):
    assembly = models.ForeignKey(
        GeneralAssembly,
        on_delete=models.CASCADE,
        related_name='convocations'
    )
    recipient_email = models.EmailField()
    sent_at = models.DateTimeField(auto_now_add=True)
    is_acknowledged = models.BooleanField(default=False)

    def __str__(self):
        return f"Convocation to {self.recipient_email} for {self.assembly.title}"
