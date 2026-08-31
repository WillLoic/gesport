from rest_framework import serializers
from apps.signatures.models import SignatureRequest, Signer


class SignerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Signer
        fields = [
            'id', 'signature_request', 'name', 'email', 'role',
            'status', 'signed_at', 'ip_address', 'signature_token', 'rejection_reason'
        ]
        read_only_fields = ['id', 'status', 'signed_at', 'signature_token']


class SignatureRequestSerializer(serializers.ModelSerializer):
    signers = SignerSerializer(many=True, read_only=True)

    class Meta:
        model = SignatureRequest
        fields = [
            'id', 'title', 'vault_document', 'hr_contract', 'status',
            'security_otp_enabled', 'expires_at', 'created_at', 'updated_at',
            'signers'
        ]
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']
