"""Services métier pour la gestion du catalogue (Catégories et Produits)."""

from apps.catalog.models.category import Category
from apps.catalog.models.product import Product


def create_category(*, club_id: int, name: str, **kwargs) -> Category:
    """Création d'une catégorie produit."""
    return Category.objects.create(club_id=club_id, name=name, **kwargs)


def update_category(*, category_id: int, **kwargs) -> Category:
    """Mise à jour d'une catégorie."""
    Category.objects.filter(pk=category_id).update(**kwargs)
    return Category.objects.get(pk=category_id)


def delete_category(*, category_id: int) -> None:
    """Suppression d'une catégorie."""
    Category.objects.filter(pk=category_id).delete()


def create_product(*, club_id: int, name: str, base_price, **kwargs) -> Product:
    """Création d'un produit."""
    return Product.objects.create(club_id=club_id, name=name, base_price=base_price, **kwargs)


def update_product(*, product_id: int, **kwargs) -> Product:
    """Mise à jour d'un produit."""
    Product.objects.filter(pk=product_id).update(**kwargs)
    return Product.objects.get(pk=product_id)


def delete_product(*, product_id: int) -> None:
    """Suppression d'un produit."""
    Product.objects.filter(pk=product_id).delete()
