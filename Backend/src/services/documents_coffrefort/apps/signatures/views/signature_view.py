from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.signatures.serializers.signature_serializer import SignatureRequestSerializer, SignerSerializer
from apps.signatures.selectors.signature_selector import (
    get_all_signature_requests, get_signature_request_by_id, get_signer_by_token
)
from apps.signatures.services.signature_service import (
    create_signature_request, sign_document, decline_signature
)
from apps.vault.selectors.vault_selector import get_document_by_id
from apps.hr_contracts.selectors.hr_selector import get_hr_contract_by_id


class SignatureRequestListCreateView(APIView):
    def get(self, request):
        status_param = request.query_params.get('status')
        requests = get_all_signature_requests(status=status_param)
        return Response(SignatureRequestSerializer(requests, many=True).data, status=status.HTTP_200_OK)

    def post(self, request):
        title = request.data.get('title')
        signers_data = request.data.get('signers', [])
        vault_doc_id = request.data.get('vault_document')
        hr_contract_id = request.data.get('hr_contract')
        security_otp = request.data.get('security_otp_enabled', True)

        if not title or not signers_data:
            return Response({'error': 'Le titre et les signataires sont obligatoires'}, status=status.HTTP_400_BAD_REQUEST)

        vault_doc = get_document_by_id(vault_doc_id) if vault_doc_id else None
        hr_contract = get_hr_contract_by_id(hr_contract_id) if hr_contract_id else None

        req = create_signature_request(
            title=title,
            signers_data=signers_data,
            vault_document=vault_doc,
            hr_contract=hr_contract,
            security_otp_enabled=security_otp
        )
        return Response(SignatureRequestSerializer(req).data, status=status.HTTP_201_CREATED)


class SignatureRequestDetailView(APIView):
    def get(self, request, pk):
        req = get_signature_request_by_id(pk)
        if not req:
            return Response({'error': 'Demande de signature non trouvée'}, status=status.HTTP_404_NOT_FOUND)
        return Response(SignatureRequestSerializer(req).data, status=status.HTTP_200_OK)


class SignerSignView(APIView):
    def post(self, request, token):
        signer = get_signer_by_token(token)
        if not signer:
            return Response({'error': 'Signataire non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        ip_address = request.META.get('REMOTE_ADDR')
        otp_entered = request.data.get('otp_code')
        try:
            signed_signer = sign_document(signer, ip_address=ip_address, otp_entered=otp_entered)
            return Response(SignerSerializer(signed_signer).data, status=status.HTTP_200_OK)
        except ValueError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)


class SignerDeclineView(APIView):
    def post(self, request, token):
        signer = get_signer_by_token(token)
        if not signer:
            return Response({'error': 'Signataire non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        reason = request.data.get('reason', '')
        declined_signer = decline_signature(signer, reason=reason)
        return Response(SignerSerializer(declined_signer).data, status=status.HTTP_200_OK)
