from django.urls import path
from apps.vault.views.vault_view import (
    VaultDocumentListCreateView,
    VaultDocumentUploadView,
    VaultDocumentDetailView,
    VaultDocumentPresignedUrlView,
    VaultDocumentAccessLogsView
)

urlpatterns = [
    path('documents/', VaultDocumentListCreateView.as_view(), name='vault-document-list-create'),
    path('documents/upload/', VaultDocumentUploadView.as_view(), name='vault-document-upload'),
    path('documents/<int:pk>/', VaultDocumentDetailView.as_view(), name='vault-document-detail'),
    path('documents/<int:pk>/presigned-url/', VaultDocumentPresignedUrlView.as_view(), name='vault-document-presigned-url'),
    path('documents/<int:pk>/logs/', VaultDocumentAccessLogsView.as_view(), name='vault-document-logs'),
]
