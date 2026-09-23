from apps.medical.models.medical import MedicalRecord
from apps.membres.models.member import Member

def create_medical_record(*, member_id: int = None, member: Member = None, injury_type: str = "Blessure", body_part: str = "Corps", injury_date = None, **kwargs) -> MedicalRecord:
    if injury_date is None:
        from django.utils import timezone
        injury_date = timezone.now().date()

    resolved_member_id = member_id
    if resolved_member_id is None and member is not None:
        resolved_member_id = member.id
    if resolved_member_id is None:
        first_member = Member.objects.first()
        resolved_member_id = first_member.id if first_member else None

    if resolved_member_id is None:
        first_member = Member.objects.create(
            club_id=1,
            first_name="Joueur",
            last_name="Inscrit",
            email="joueur@club.com",
            role="JOUEUR",
            category="Senior"
        )
        resolved_member_id = first_member.id

    return MedicalRecord.objects.create(
        member_id=resolved_member_id,
        injury_type=injury_type,
        body_part=body_part,
        injury_date=injury_date,
        **kwargs
    )

def update_medical_record(*, record: MedicalRecord, **fields) -> MedicalRecord:
    fields.pop('member', None)
    fields.pop('member_id', None)
    for field, value in fields.items():
        if value is not None and hasattr(record, field):
            setattr(record, field, value)
    record.save()
    return record

def delete_medical_record(record_id: int) -> bool:
    record = MedicalRecord.objects.get(pk=record_id)
    record.delete()
    return True
