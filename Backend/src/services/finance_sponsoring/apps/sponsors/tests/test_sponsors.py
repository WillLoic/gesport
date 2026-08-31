from django.test import TestCase
from datetime import date
from decimal import Decimal
from apps.sponsors.services.sponsor_service import (
    create_sponsor, create_sponsorship_pack, create_sponsorship_contract,
    sign_sponsorship_contract, terminate_sponsorship_contract
)


class SponsorTestCase(TestCase):

    def setUp(self):
        self.sponsor = create_sponsor(
            club_id=1,
            company_name='Nike France',
            contact_name='Pierre Martin',
            contact_email='pierre.martin@nike.com',
            sponsor_type='corporate',
            siret='12345678900012',
        )
        self.pack = create_sponsorship_pack(
            club_id=1,
            name='Pack Maillot Or',
            price=Decimal('15000.00'),
            description='Flocage face maillot principal + 4 panneaux terrain',
        )

    def test_create_sponsor_and_pack(self):
        self.assertEqual(self.sponsor.company_name, 'Nike France')
        self.assertEqual(self.sponsor.status, 'prospect')
        self.assertEqual(self.pack.price, Decimal('15000.00'))

    def test_create_contract_draft(self):
        contract = create_sponsorship_contract(
            club_id=1,
            sponsor=self.sponsor,
            pack=self.pack,
            start_date=date(2026, 9, 1),
            end_date=date(2027, 8, 31),
            amount=Decimal('15000.00'),
        )
        self.assertTrue(contract.contract_number.startswith('CTR-2026-'))
        self.assertEqual(contract.status, 'draft')

    def test_sign_contract_activates_sponsor(self):
        contract = create_sponsorship_contract(
            club_id=1,
            sponsor=self.sponsor,
            pack=self.pack,
            start_date=date(2026, 9, 1),
            end_date=date(2027, 8, 31),
            amount=Decimal('15000.00'),
        )
        signed = sign_sponsorship_contract(contract=contract)
        self.assertEqual(signed.status, 'signed')

        self.sponsor.refresh_from_db()
        self.assertEqual(self.sponsor.status, 'active')

    def test_terminate_contract(self):
        contract = create_sponsorship_contract(
            club_id=1,
            sponsor=self.sponsor,
            start_date=date(2026, 1, 1),
            end_date=date(2026, 12, 31),
            amount=Decimal('5000.00'),
        )
        terminated = terminate_sponsorship_contract(contract=contract)
        self.assertEqual(terminated.status, 'terminated')

