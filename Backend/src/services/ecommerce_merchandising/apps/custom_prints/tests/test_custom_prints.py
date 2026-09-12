from django.test import TestCase
from decimal import Decimal
from apps.custom_prints.models import CustomPrintOption, CustomPrintDetail
from apps.custom_prints.services.custom_print_service import (
    create_print_option, update_print_option, delete_print_option, create_print_detail
)


class CustomPrintsTestCase(TestCase):

    def setUp(self):
        self.club_id = 1
        self.option = create_print_option(
            club_id=self.club_id,
            name="Flocage Nom + Numéro Officiel",
            print_type=CustomPrintOption.PrintType.NAME_NUMBER,
            extra_price=Decimal("12.00"),
            allowed_locations=["BACK"],
        )

    def test_create_print_option(self):
        self.assertEqual(self.option.name, "Flocage Nom + Numéro Officiel")
        self.assertEqual(self.option.extra_price, Decimal("12.00"))
        self.assertEqual(self.option.print_type, "NAME_NUMBER")

    def test_update_print_option(self):
        updated = update_print_option(option_id=self.option.id, extra_price=Decimal("15.00"))
        self.assertEqual(updated.extra_price, Decimal("15.00"))

    def test_delete_print_option(self):
        opt_id = self.option.id
        delete_print_option(option_id=opt_id)
        self.assertFalse(CustomPrintOption.objects.filter(id=opt_id).exists())

    def test_create_print_detail_copies_extra_price(self):
        detail = create_print_detail(
            option_id=self.option.id,
            custom_name="MBAPPE",
            custom_number="10",
            location="BACK",
        )
        self.assertEqual(detail.custom_name, "MBAPPE")
        self.assertEqual(detail.custom_number, "10")
        self.assertEqual(detail.extra_price, Decimal("12.00"))
        self.assertEqual(detail.option, self.option)

