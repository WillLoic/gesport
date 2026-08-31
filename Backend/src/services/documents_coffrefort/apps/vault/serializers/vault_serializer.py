from rest_framework import serializers
from apps.vault.models import VaultDocument, DocumentAccessLog


class DocumentAccessLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentAccessLog
        fields = ['id', 'document', 'accessed_by', 'access_type', 'ip_address', 'timestamp']
        read_only_fields = ['id', 'timestamp']


class VaultDocumentSerializer(serializers.ModelSerializer):
    access_logs = DocumentAccessLogSerializer(many=True, read_only=True)

    class Meta:
        model = VaultDocument
        fields = [
            'id', 'title', 'description', 'file_path_or_s3_key', 'file_size',
            'mime_type', 'sha256_hash', 'confidentiality_level', 'is_encrypted',
            'encryption_algorithm', 'uploaded_by', 'created_at', 'updated_at',
            'access_logs'
        ]
        read_only_fields = ['id', 'sha256_hash', 'created_at', 'updated_at']
