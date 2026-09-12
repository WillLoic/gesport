"""Selectors (requêtes ORM) pour le catalogue produit."""

from apps.catalog.models.category import Category
from apps.catalog.models.product import Product


def list_categories_by_club(club_id: int):
    """Liste les catégories de produits d'un club."""
    return Category.objects.filter(club_id=club_id, is_active=True)


def get_category_by_id(category_id: int) -> Category:
    """Récupère une catégorie par ID."""
    return Category.objects.get(pk=category_id)


def list_products_by_club(club_id: int, category_id: int = None, status: str = None):
    """Liste les produits d'un club avec filtres optionnels."""
    qs = Product.objects.filter(club_id=club_id)
    if category_id:
        qs = qs.filter(category_id=category_id)
    if status:
        qs = qs.filter(status=status)
    return qs.select_related('category')


def list_published_products_by_club(club_id: int, category_id: int = None):
    """Liste les produits publiés accessibles en boutique publique."""
    return list_products_by_club(club_id, category_id=category_id, status=Product.Status.PUBLISHED)


def get_product_by_id(product_id: int) -> Product:
    """Récupère un produit par ID."""
    return Product.objects.select_related('category').get(pk=product_id)


def get_product_by_slug(club_id: int, slug: str) -> Product:
    """Récupère un produit par slug et club_id."""
    return Product.objects.select_related('category').get(club_id=club_id, slug=slug)
