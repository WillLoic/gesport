from django.db import models


class StorageLocation(models.Model):
    name = models.CharField(max_length=255)
    building = models.CharField(max_length=150, blank=True, default='')
    description = models.TextField(blank=True, default='')

    def __str__(self):
        return f"{self.name} ({self.building})" if self.building else self.name
