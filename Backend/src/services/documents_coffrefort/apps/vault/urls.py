from django.urls import path
from apps.vault.views.vault_view import (
    VaultDocumentListCreateView,
    VaultDocumentDetailView,
    VaultDocumentPresignedUrlView,
    VaultDocumentAccessLogsView
)

urlpatterns = [
    path('documents/', VaultDocumentListCreateView.as_view(), name='vault-document-list-create'),
    path('documents/<int:pk>/', VaultDocumentDetailView.as_view(), name='vault-document-detail'),
    path('documents/<int:pk>/presigned-url/', VaultDocumentPresignedUrlView.as_view(), name='vault-document-presigned-url'),
    path('documents/<int:pk>/logs/', VaultDocumentAccessLogsView.as_view(), name='vault-document-logs'),
]
