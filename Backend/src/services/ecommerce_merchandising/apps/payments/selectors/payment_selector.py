"""Selectors (requêtes ORM) pour les transactions de paiement."""

from apps.payments.models.transaction import PaymentTransaction


def list_payments_by_order(order_id: int):
    """Liste les tentatives/transactions de paiement pour une commande."""
    return PaymentTransaction.objects.filter(order_id=order_id)


def get_transaction_by_id(transaction_id: str) -> PaymentTransaction:
    """Récupère une transaction par son ID externe."""
    return PaymentTransaction.objects.select_related('order').get(transaction_id=transaction_id)
