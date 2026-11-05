from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from apps.vault.serializers.vault_serializer import VaultDocumentSerializer, DocumentAccessLogSerializer
from apps.vault.selectors.vault_selector import get_all_documents, get_document_by_id, get_document_access_logs
from apps.vault.services.vault_service import (
    upload_vault_document,
    upload_file_to_vault,
    update_vault_document,
    delete_vault_document,
    generate_presigned_url
)


class VaultDocumentListCreateView(APIView):
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get(self, request):
        confidentiality = request.query_params.get('confidentiality')
        documents = get_all_documents(confidentiality_level=confidentiality)
        serializer = VaultDocumentSerializer(documents, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        # Si un vrai fichier binaire est fourni dans la requête (multipart)
        file_obj = request.FILES.get('file')
        if file_obj:
            title = request.data.get('title') or file_obj.name
            description = request.data.get('description', '')
            category = request.data.get('category', '')
            confidentiality = request.data.get('confidentiality_level', 'CONFIDENTIAL')
            uploaded_by = request.data.get('uploaded_by', 'system')
            is_encrypted = request.data.get('is_encrypted') in [True, 'true', 'True', '1', 1]
            encryption_algorithm = request.data.get('encryption_algorithm', 'AES-256')

            doc = upload_file_to_vault(
                file=file_obj,
                title=title,
                description=description,
                confidentiality_level=confidentiality,
                uploaded_by=uploaded_by,
                is_encrypted=is_encrypted,
                encryption_algorithm=encryption_algorithm,
                category=category,
            )
            return Response(VaultDocumentSerializer(doc).data, status=status.HTTP_201_CREATED)

        # Sinon, création classique par métadonnées JSON
        serializer = VaultDocumentSerializer(data=request.data)
        if serializer.is_valid():
            doc = upload_vault_document(
                title=serializer.validated_data['title'],
                file_path_or_s3_key=serializer.validated_data.get('file_path_or_s3_key', ''),
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


class VaultDocumentUploadView(APIView):
    """
    Endpoint dédié à l'upload direct de fichier physique (multipart/form-data).
    En dev  : sauvegarde sur disque local (MEDIA_ROOT/vault_documents/)
    En prod : envoi vers le bucket AWS S3 via django-storages
    """
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'Aucun fichier transmis dans la requête ("file" manquant)'}, status=status.HTTP_400_BAD_REQUEST)

        title = request.data.get('title') or file_obj.name
        description = request.data.get('description', '')
        category = request.data.get('category', '')
        confidentiality = request.data.get('confidentiality_level', 'CONFIDENTIAL')
        uploaded_by = request.data.get('uploaded_by', 'system')
        is_encrypted = request.data.get('is_encrypted') in [True, 'true', 'True', '1', 1]
        encryption_algorithm = request.data.get('encryption_algorithm', 'AES-256')

        doc = upload_file_to_vault(
            file=file_obj,
            title=title,
            description=description,
            confidentiality_level=confidentiality,
            uploaded_by=uploaded_by,
            is_encrypted=is_encrypted,
            encryption_algorithm=encryption_algorithm,
            category=category,
        )
        return Response(VaultDocumentSerializer(doc).data, status=status.HTTP_201_CREATED)


class VaultDocumentDetailView(APIView):
    def get(self, request, pk):
        doc = get_document_by_id(pk)
        if not doc:
            return Response({'error': 'Document non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        serializer = VaultDocumentSerializer(doc)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        doc = get_document_by_id(pk)
        if not doc:
            return Response({'error': 'Document non trouvé'}, status=status.HTTP_404_NOT_FOUND)

        title = request.data.get('title')
        description = request.data.get('description')
        confidentiality_level = request.data.get('confidentiality_level')

        updated_doc = update_vault_document(
            document=doc,
            title=title,
            description=description,
            confidentiality_level=confidentiality_level
        )
        return Response(VaultDocumentSerializer(updated_doc).data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        return self.put(request, pk)

    def delete(self, request, pk):
        doc = get_document_by_id(pk)
        if not doc:
            return Response({'error': 'Document non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        delete_vault_document(doc)
        return Response({'message': f'Document {pk} et son fichier ont été supprimés avec succès.'}, status=status.HTTP_200_OK)


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
