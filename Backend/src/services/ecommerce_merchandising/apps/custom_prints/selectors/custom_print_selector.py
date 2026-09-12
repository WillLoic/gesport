"""Selectors (requêtes ORM) pour les options de flocage."""

from apps.custom_prints.models.option import CustomPrintOption
from apps.custom_prints.models.print_detail import CustomPrintDetail


def list_print_options_by_club(club_id: int):
    """Liste les options de flocage configurées pour un club."""
    return CustomPrintOption.objects.filter(club_id=club_id, is_active=True)


def get_print_option_by_id(option_id: int) -> CustomPrintOption:
    """Récupère une option de flocage par ID."""
    return CustomPrintOption.objects.get(pk=option_id)
