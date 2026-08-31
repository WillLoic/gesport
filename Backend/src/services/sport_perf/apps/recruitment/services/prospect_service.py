from apps.recruitment.models.prospect import TalentProspect

def create_prospect(*, club_id: int, first_name: str, last_name: str, birth_year: int, position: str, **kwargs) -> TalentProspect:
    return TalentProspect.objects.create(
        club_id=club_id,
        first_name=first_name,
        last_name=last_name,
        birth_year=birth_year,
        position=position,
        **kwargs
    )

def update_prospect(*, prospect: TalentProspect, **fields) -> TalentProspect:
    for field, value in fields.items():
        setattr(prospect, field, value)
    prospect.save(update_fields=list(fields.keys()))
    return prospect
