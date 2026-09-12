from django.test import TestCase
from decimal import Decimal
from apps.catalog.models import Category, Product
from apps.catalog.services.catalog_service import (
    create_category, update_category, delete_category,
    create_product, update_product, delete_product
)


class CatalogTestCase(TestCase):

    def setUp(self):
        self.club_id = 1
        self.category = create_category(
            club_id=self.club_id,
            name="Maillots Officiels",
            description="Maillots de la saison 2026",
        )

    def test_create_category_generates_slug(self):
        self.assertEqual(self.category.name, "Maillots Officiels")
        self.assertEqual(self.category.slug, "maillots-officiels")
        self.assertEqual(self.category.club_id, self.club_id)

    def test_update_category(self):
        updated = update_category(category_id=self.category.id, name="Maillots & Equipements")
        self.assertEqual(updated.name, "Maillots & Equipements")

    def test_delete_category(self):
        cat_id = self.category.id
        delete_category(category_id=cat_id)
        self.assertFalse(Category.objects.filter(id=cat_id).exists())

    def test_create_product_with_category(self):
        product = create_product(
            club_id=self.club_id,
            name="Maillot Domicile 2026",
            base_price=Decimal("75.00"),
            category=self.category,
            is_customizable=True,
        )
        self.assertEqual(product.name, "Maillot Domicile 2026")
        self.assertEqual(product.slug, "maillot-domicile-2026")
        self.assertEqual(product.base_price, Decimal("75.00"))
        self.assertTrue(product.is_customizable)
        self.assertEqual(product.category, self.category)

    def test_update_product(self):
        product = create_product(
            club_id=self.club_id,
            name="Gourde Club",
            base_price=Decimal("15.00"),
        )
        updated = update_product(product_id=product.id, base_price=Decimal("12.50"))
        self.assertEqual(updated.base_price, Decimal("12.50"))

    def test_delete_product(self):
        product = create_product(
            club_id=self.club_id,
            name="Écharpe Supporter",
            base_price=Decimal("20.00"),
        )
        p_id = product.id
        delete_product(product_id=p_id)
        self.assertFalse(Product.objects.filter(id=p_id).exists())

