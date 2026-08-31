from django.db import models
from apps.vault.models.vault_document import VaultDocument


class AccessType(models.TextChoices):
    READ = 'READ', 'Lecture'
    DOWNLOAD = 'DOWNLOAD', 'Téléchargement'
    PRESIGNED_URL_GENERATED = 'PRESIGNED_URL_GENERATED', 'URL Pré-signée'


class DocumentAccessLog(models.Model):
    document = models.ForeignKey(
        VaultDocument,
        on_delete=models.CASCADE,
        related_name='access_logs'
    )
    accessed_by = models.CharField(max_length=150, default='anonymous')
    access_type = models.CharField(
        max_length=30,
        choices=AccessType.choices,
        default=AccessType.READ
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.document.title} - {self.access_type} by {self.accessed_by} at {self.timestamp}"
