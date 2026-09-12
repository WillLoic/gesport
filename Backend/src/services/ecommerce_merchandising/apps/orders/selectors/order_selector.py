"""Selectors (requêtes ORM) pour les paniers et commandes."""

from apps.orders.models.cart import Cart, CartItem
from apps.orders.models.order import Order, OrderItem


def get_or_create_cart(session_id: str, club_id: int, user_id: int = None) -> Cart:
    """Récupère ou crée le panier d'achat d'un utilisateur / session pour un club."""
    cart, _ = Cart.objects.get_or_create(
        session_id=session_id,
        club_id=club_id,
        defaults={'user_id': user_id}
    )
    return cart


def get_cart_by_session(session_id: str, club_id: int) -> Cart:
    """Récupère le panier d'une session."""
    return Cart.objects.prefetch_related('items__variant__product', 'items__print_detail').get(
        session_id=session_id,
        club_id=club_id
    )


def list_orders_by_club(club_id: int, status: str = None):
    """Liste les commandes d'un club."""
    qs = Order.objects.filter(club_id=club_id)
    if status:
        qs = qs.filter(status=status)
    return qs.prefetch_related('items__print_detail')


def list_orders_by_user(user_id: int):
    """Liste l'historique des commandes d'un utilisateur."""
    return Order.objects.filter(user_id=user_id).prefetch_related('items')


def get_order_by_id(order_id: int) -> Order:
    """Récupère une commande par ID."""
    return Order.objects.prefetch_related('items__print_detail').get(pk=order_id)


def get_order_by_number(order_number: str) -> Order:
    """Récupère une commande par son numéro unique."""
    return Order.objects.prefetch_related('items__print_detail').get(order_number=str(order_number))
