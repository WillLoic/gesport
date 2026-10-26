from django.db import models


class StaffDepartment(models.TextChoices):
    DIRECTION = 'Direction & Bureau', 'Direction & Bureau'
    TECHNIQUE = 'Staff Technique', 'Staff Technique'
    MEDICAL = 'Pôle Médical & Santé', 'Pôle Médical & Santé'
    LOGISTIQUE = 'Logistique & Équipement', 'Logistique & Équipement'
    COMMUNICATION = 'Communication & Événements', 'Communication & Événements'


class StaffAccessLevel(models.TextChoices):
    ADMIN = 'Admin', 'Admin Total'
    MANAGER = 'Manager', 'Manager Sportif / Bureau'
    COACH = 'Coach', 'Entraîneur / Coach'
    MEDICAL = 'Medical', 'Pôle Médical & Soins'
    STAFF = 'Staff', 'Staff Opérationnel'


class ClubStaffMember(models.Model):
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=200)
    department = models.CharField(
        max_length=50,
        choices=StaffDepartment.choices,
        default=StaffDepartment.TECHNIQUE
    )
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True, default='')
    contract_type = models.CharField(max_length=100, blank=True, default='CDI')
    qualifications = models.JSONField(default=list, blank=True)
    assigned_teams = models.JSONField(default=list, blank=True)
    access_level = models.CharField(
        max_length=20,
        choices=StaffAccessLevel.choices,
        default=StaffAccessLevel.COACH
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['department', 'name']

    def __str__(self):
        return f"{self.name} – {self.role} ({self.department})"
