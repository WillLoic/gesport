from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.vault.serializers.vault_serializer import VaultDocumentSerializer, DocumentAccessLogSerializer
from apps.vault.selectors.vault_selector import get_all_documents, get_document_by_id, get_document_access_logs
from apps.vault.services.vault_service import upload_vault_document, generate_presigned_url


class VaultDocumentListCreateView(APIView):
    def get(self, request):
        confidentiality = request.query_params.get('confidentiality')
        documents = get_all_documents(confidentiality_level=confidentiality)
        serializer = VaultDocumentSerializer(documents, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = VaultDocumentSerializer(data=request.data)
        if serializer.is_valid():
            doc = upload_vault_document(
                title=serializer.validated_data['title'],
                file_path_or_s3_key=serializer.validated_data['file_path_or_s3_key'],
                description=serializer.validated_data.get('description', ''),
                file_size=serializer.validated_data.get('file_size', 0),
                mime_type=serializer.validated_data.get('mime_type', 'application/octet-stream'),
                confidentiality_level=serializer.validated_data.get('confidentiality_level', 'CONFIDENTIAL'),
                uploaded_by=serializer.validated_data.get('uploaded_by', 'system'),
                is_encrypted=serializer.validated_data.get('is_encrypted', True),
                encryption_algorithm=serializer.validated_data.get('encryption_algorithm', 'AES-256')
            )
            return Response(VaultDocumentSerializer(doc).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VaultDocumentDetailView(APIView):
    def get(self, request, pk):
        doc = get_document_by_id(pk)
        if not doc:
            return Response({'error': 'Document non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        serializer = VaultDocumentSerializer(doc)
        return Response(serializer.data, status=status.HTTP_200_OK)


class VaultDocumentPresignedUrlView(APIView):
    def post(self, request, pk):
        doc = get_document_by_id(pk)
        if not doc:
            return Response({'error': 'Document non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        accessed_by = request.data.get('accessed_by', 'anonymous')
        ip_address = request.META.get('REMOTE_ADDR')
        res = generate_presigned_url(doc, accessed_by=accessed_by, ip_address=ip_address)
        return Response(res, status=status.HTTP_200_OK)


class VaultDocumentAccessLogsView(APIView):
    def get(self, request, pk):
        doc = get_document_by_id(pk)
        if not doc:
            return Response({'error': 'Document non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        logs = get_document_access_logs(pk)
        serializer = DocumentAccessLogSerializer(logs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
