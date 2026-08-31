from django.urls import path
from apps.signatures.views.signature_view import (
    SignatureRequestListCreateView,
    SignatureRequestDetailView,
    SignerSignView,
    SignerDeclineView
)

urlpatterns = [
    path('requests/', SignatureRequestListCreateView.as_view(), name='signature-request-list-create'),
    path('requests/<int:pk>/', SignatureRequestDetailView.as_view(), name='signature-request-detail'),
    path('signers/<str:token>/sign/', SignerSignView.as_view(), name='signer-sign'),
    path('signers/<str:token>/decline/', SignerDeclineView.as_view(), name='signer-decline'),
]
