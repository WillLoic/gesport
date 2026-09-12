"""Service d'intégration de la passerelle de paiement Stripe."""

import logging
import uuid
from django.conf import settings
from apps.orders.models.order import Order
from apps.orders.services.order_service import update_order_status
from apps.payments.models.transaction import PaymentTransaction

logger = logging.getLogger(__name__)


def create_stripe_checkout_session(order: Order, success_url: str = "", cancel_url: str = "") -> dict:
    """Crée une session de paiement Stripe pour une commande."""
    stripe_key = getattr(settings, 'STRIPE_SECRET_KEY', '')

    if not stripe_key or stripe_key.startswith('mock'):
        logger.info(f"[MOCK STRIPE] Session créée pour Commande #{order.order_number} ({order.total_price} {order.currency})")
        tx_id = f"pi_mock_{uuid.uuid4().hex[:12]}"
        
        tx = PaymentTransaction.objects.create(
            order=order,
            provider=PaymentTransaction.Provider.STRIPE,
            transaction_id=tx_id,
            amount=order.total_price,
            currency=order.currency,
            status=PaymentTransaction.Status.PENDING
        )

        return {
            "session_id": f"cs_mock_{uuid.uuid4().hex[:16]}",
            "checkout_url": f"https://checkout.stripe.com/pay/mock_{tx_id}",
            "transaction_id": tx_id
        }

    # Integration reelle via sdk Stripe
    try:
        import stripe
        stripe.api_key = stripe_key
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': order.currency.lower(),
                    'product_data': {'name': f"Commande Gesport #{order.order_number}"},
                    'unit_amount': int(order.total_price * 100),
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=success_url or 'https://gesport.com/checkout/success',
            cancel_url=cancel_url or 'https://gesport.com/checkout/cancel',
            client_reference_id=str(order.id)
        )

        tx = PaymentTransaction.objects.create(
            order=order,
            provider=PaymentTransaction.Provider.STRIPE,
            transaction_id=session.id,
            amount=order.total_price,
            currency=order.currency,
            status=PaymentTransaction.Status.PENDING
        )

        return {
            "session_id": session.id,
            "checkout_url": session.url,
            "transaction_id": session.id
        }
    except Exception as e:
        logger.exception("Erreur lors de la création de la session Stripe")
        raise e


def handle_stripe_webhook_event(event_payload: dict) -> dict:
    """Traite les événements webhook renvoyés par Stripe (ex: checkout.session.completed)."""
    event_type = event_payload.get('type')
    data_obj = event_payload.get('data', {}).get('object', {})

    if event_type in ['checkout.session.completed', 'payment_intent.succeeded']:
        session_or_intent_id = data_obj.get('id')
        try:
            tx = PaymentTransaction.objects.get(transaction_id=session_or_intent_id)
            tx.status = PaymentTransaction.Status.SUCCESS
            tx.metadata = event_payload
            tx.save()

            # Mettre à jour la commande et décrémenter le stock
            update_order_status(order_id=tx.order.id, new_status=Order.Status.PAID)
            return {"status": "SUCCESS", "message": f"Paiement validé pour la commande #{tx.order.order_number}."}
        except PaymentTransaction.DoesNotExist:
            logger.warning(f"Transaction Stripe {session_or_intent_id} introuvable lors du webhook.")
            return {"status": "NOT_FOUND", "message": "Transaction non trouvée."}

    return {"status": "IGNORED", "message": f"Événement '{event_type}' ignoré."}
