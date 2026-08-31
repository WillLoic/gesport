from django.db import models


class ConfidentialityLevel(models.TextChoices):
    PUBLIC = 'PUBLIC', 'Public'
    INTERNAL = 'INTERNAL', 'Interne'
    CONFIDENTIAL = 'CONFIDENTIAL', 'Confidentiel'
    RESTRICTED = 'RESTRICTED', 'Restreint'


class VaultDocument(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    file_path_or_s3_key = models.CharField(max_length=512)
    file_size = models.BigIntegerField(default=0)
    mime_type = models.CharField(max_length=100, default='application/octet-stream')
    sha256_hash = models.CharField(max_length=64, blank=True, default='')
    confidentiality_level = models.CharField(
        max_length=20,
        choices=ConfidentialityLevel.choices,
        default=ConfidentialityLevel.CONFIDENTIAL
    )
    is_encrypted = models.BooleanField(default=True)
    encryption_algorithm = models.CharField(max_length=50, default='AES-256')
    uploaded_by = models.CharField(max_length=150, blank=True, default='system')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.confidentiality_level})"
