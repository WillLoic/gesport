"""Routes URL pour les transactions de paiement et webhooks."""

from django.urls import path
from apps.payments.views import (
    CreateStripeSessionView,
    PayLibPaymentView,
    PassSportPaymentView,
    StripeWebhookView,
    OrderPaymentsListView,
)

urlpatterns = [
    path('stripe/checkout-session/', CreateStripeSessionView.as_view(), name='payments-stripe-checkout'),
    path('stripe/webhook/', StripeWebhookView.as_view(), name='payments-stripe-webhook'),
    path('paylib/', PayLibPaymentView.as_view(), name='payments-paylib'),
    path('pass-sport/', PassSportPaymentView.as_view(), name='payments-pass-sport'),
    path('order/<int:order_id>/', OrderPaymentsListView.as_view(), name='payments-order-list'),
]
