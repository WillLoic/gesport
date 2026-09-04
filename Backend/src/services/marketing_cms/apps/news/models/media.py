"""
Modèle MediaItem — Médiathèque du club (images, vidéos, documents).
"""

from django.db import models


class MediaItem(models.Model):
    """Fichier média uploadé dans la médiathèque du club."""

    MEDIA_TYPE_CHOICES = [
        ('IMAGE', 'Image'),
        ('VIDEO', 'Vidéo'),
        ('DOCUMENT', 'Document'),
    ]

    club_id = models.IntegerField(verbose_name="ID du Club", db_index=True)
    title = models.CharField(max_length=200, verbose_name="Titre")
    media_type = models.CharField(max_length=20, choices=MEDIA_TYPE_CHOICES, default='IMAGE')
    file = models.FileField(upload_to='media_library/%Y/%m/', verbose_name="Fichier")
    file_url = models.URLField(blank=True, default='', verbose_name="URL externe (optionnel)")
    file_size = models.PositiveIntegerField(default=0, verbose_name="Taille (octets)")
    mime_type = models.CharField(max_length=100, blank=True, default='', verbose_name="Type MIME")
    category = models.CharField(max_length=80, blank=True, default='', verbose_name="Catégorie")
    alt_text = models.CharField(max_length=200, blank=True, default='', verbose_name="Texte alternatif")
    uploaded_by_id = models.IntegerField(null=True, blank=True, verbose_name="ID Utilisateur (IAM)")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'cms_media_items'
        verbose_name = 'Média'
        verbose_name_plural = 'Médias'
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f"{self.title} ({self.media_type})"
