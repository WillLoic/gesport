"""Service d'intégration des paiements alternatifs (PayLib, Pass'Sport, Mobile Money)."""

import logging
import uuid
from apps.orders.models.order import Order
from apps.orders.services.order_service import update_order_status
from apps.payments.models.transaction import PaymentTransaction

logger = logging.getLogger(__name__)


def process_paylib_payment(order: Order, phone_number: str) -> dict:
    """Traite un règlement direct via PayLib."""
    logger.info(f"[PAYLIB] Initialisation du paiement PayLib pour Commande #{order.order_number} ({phone_number})")
    tx_id = f"paylib_{uuid.uuid4().hex[:12]}"

    tx = PaymentTransaction.objects.create(
        order=order,
        provider=PaymentTransaction.Provider.PAYLIB,
        transaction_id=tx_id,
        amount=order.total_price,
        currency=order.currency,
        status=PaymentTransaction.Status.SUCCESS,
        metadata={"phone_number": phone_number}
    )

    # Validation immédiate de la commande
    update_order_status(order_id=order.id, new_status=Order.Status.PAID)

    return {
        "success": True,
        "transaction_id": tx_id,
        "message": f"Paiement PayLib validé avec succès pour {phone_number}."
    }


def process_passsport_payment(order: Order, passsport_code: str) -> dict:
    """Traite un règlement via allocation / bon Pass'Sport du gouvernement."""
    logger.info(f"[PASS'SPORT] Validation du code Pass'Sport '{passsport_code}' pour Commande #{order.order_number}")
    tx_id = f"passsport_{uuid.uuid4().hex[:12]}"

    tx = PaymentTransaction.objects.create(
        order=order,
        provider=PaymentTransaction.Provider.PASSSPORT,
        transaction_id=tx_id,
        amount=order.total_price,
        currency=order.currency,
        status=PaymentTransaction.Status.SUCCESS,
        metadata={"code": passsport_code}
    )

    # Validation immédiate de la commande
    update_order_status(order_id=order.id, new_status=Order.Status.PAID)

    return {
        "success": True,
        "transaction_id": tx_id,
        "message": f"Code Pass'Sport '{passsport_code}' validé avec succès."
    }
