"""Services métier pour la gestion des options et détails de flocage."""

from apps.custom_prints.models.option import CustomPrintOption
from apps.custom_prints.models.print_detail import CustomPrintDetail


def create_print_option(*, club_id: int, name: str, extra_price, **kwargs) -> CustomPrintOption:
    """Création d'une option de flocage."""
    return CustomPrintOption.objects.create(
        club_id=club_id,
        name=name,
        extra_price=extra_price,
        **kwargs
    )


def update_print_option(*, option_id: int, **kwargs) -> CustomPrintOption:
    """Mise à jour d'une option de flocage."""
    CustomPrintOption.objects.filter(pk=option_id).update(**kwargs)
    return CustomPrintOption.objects.get(pk=option_id)


def delete_print_option(*, option_id: int) -> None:
    """Suppression/Desactivation d'une option de flocage."""
    CustomPrintOption.objects.filter(pk=option_id).delete()


def create_print_detail(*, custom_name: str = "", custom_number: str = "", option_id: int = None, **kwargs) -> CustomPrintDetail:
    """Création des détails d'un flocage pour un article commandé."""
    extra_price = 0.00
    if option_id:
        try:
            option = CustomPrintOption.objects.get(pk=option_id)
            extra_price = option.extra_price
        except CustomPrintOption.DoesNotExist:
            option = None
    else:
        option = None

    return CustomPrintDetail.objects.create(
        option=option,
        custom_name=custom_name,
        custom_number=custom_number,
        extra_price=extra_price,
        **kwargs
    )
