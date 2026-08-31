from typing import Optional
from django.db.models import QuerySet
from apps.governance.models import GeneralAssembly, Resolution, AssemblyMinutes


def get_all_assemblies(status: Optional[str] = None) -> QuerySet[GeneralAssembly]:
    qs = GeneralAssembly.objects.all()
    if status:
        qs = qs.filter(status=status)
    return qs


def get_assembly_by_id(assembly_id: int) -> Optional[GeneralAssembly]:
    return GeneralAssembly.objects.filter(id=assembly_id).first()


def get_assembly_resolutions(assembly_id: int) -> QuerySet[Resolution]:
    return Resolution.objects.filter(assembly_id=assembly_id)


def get_assembly_minutes(assembly_id: int) -> Optional[AssemblyMinutes]:
    return AssemblyMinutes.objects.filter(assembly_id=assembly_id).first()
