from apps.medical.models.medical import MedicalRecord

def create_medical_record(*, member_id: int, injury_type: str, body_part: str, injury_date, **kwargs) -> MedicalRecord:
    return MedicalRecord.objects.create(
        member_id=member_id,
        injury_type=injury_type,
        body_part=body_part,
        injury_date=injury_date,
        **kwargs
    )

def update_medical_record(*, record: MedicalRecord, **fields) -> MedicalRecord:
    for field, value in fields.items():
        setattr(record, field, value)
    record.save(update_fields=list(fields.keys()))
    return record
