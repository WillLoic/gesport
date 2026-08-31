from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.governance.serializers.governance_serializer import (
    GeneralAssemblySerializer, ResolutionSerializer, AssemblyMinutesSerializer
)
from apps.governance.selectors.governance_selector import (
    get_all_assemblies, get_assembly_by_id, get_assembly_resolutions, get_assembly_minutes
)
from apps.governance.services.governance_service import (
    create_assembly, send_convocations, add_resolution, vote_on_resolution, finalize_assembly_minutes
)
from apps.governance.models import Resolution
from apps.vault.selectors.vault_selector import get_document_by_id


class GeneralAssemblyListCreateView(APIView):
    def get(self, request):
        status_param = request.query_params.get('status')
        assemblies = get_all_assemblies(status=status_param)
        serializer = GeneralAssemblySerializer(assemblies, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = GeneralAssemblySerializer(data=request.data)
        if serializer.is_valid():
            assembly = create_assembly(
                title=serializer.validated_data['title'],
                scheduled_at=serializer.validated_data['scheduled_at'],
                assembly_type=serializer.validated_data.get('assembly_type', 'ORDINARY'),
                location=serializer.validated_data.get('location', 'Siège social')
            )
            recipients = request.data.get('recipient_emails', [])
            if recipients:
                send_convocations(assembly, recipients)
            return Response(GeneralAssemblySerializer(assembly).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GeneralAssemblyDetailView(APIView):
    def get(self, request, pk):
        assembly = get_assembly_by_id(pk)
        if not assembly:
            return Response({'error': 'Assemblée générale non trouvée'}, status=status.HTTP_404_NOT_FOUND)
        serializer = GeneralAssemblySerializer(assembly)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ResolutionListCreateView(APIView):
    def get(self, request, assembly_pk):
        assembly = get_assembly_by_id(assembly_pk)
        if not assembly:
            return Response({'error': 'Assemblée générale non trouvée'}, status=status.HTTP_404_NOT_FOUND)
        resolutions = get_assembly_resolutions(assembly_pk)
        serializer = ResolutionSerializer(resolutions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, assembly_pk):
        assembly = get_assembly_by_id(assembly_pk)
        if not assembly:
            return Response({'error': 'Assemblée générale non trouvée'}, status=status.HTTP_404_NOT_FOUND)
        title = request.data.get('title')
        description = request.data.get('description', '')
        if not title:
            return Response({'error': 'Le titre est obligatoire'}, status=status.HTTP_400_BAD_REQUEST)
        res = add_resolution(assembly, title=title, description=description)
        return Response(ResolutionSerializer(res).data, status=status.HTTP_201_CREATED)


class ResolutionVoteView(APIView):
    def post(self, request, pk):
        res = Resolution.objects.filter(pk=pk).first()
        if not res:
            return Response({'error': 'Résolution non trouvée'}, status=status.HTTP_404_NOT_FOUND)
        votes_for = int(request.data.get('votes_for', 0))
        votes_against = int(request.data.get('votes_against', 0))
        votes_abstain = int(request.data.get('votes_abstain', 0))
        updated_res = vote_on_resolution(res, votes_for, votes_against, votes_abstain)
        return Response(ResolutionSerializer(updated_res).data, status=status.HTTP_200_OK)


class AssemblyMinutesDetailView(APIView):
    def get(self, request, assembly_pk):
        minutes = get_assembly_minutes(assembly_pk)
        if not minutes:
            return Response({'error': 'Procès-verbal non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        return Response(AssemblyMinutesSerializer(minutes).data, status=status.HTTP_200_OK)

    def post(self, request, assembly_pk):
        assembly = get_assembly_by_id(assembly_pk)
        if not assembly:
            return Response({'error': 'Assemblée générale non trouvée'}, status=status.HTTP_404_NOT_FOUND)
        content_summary = request.data.get('content_summary', '')
        vault_doc_id = request.data.get('vault_document_id')
        vault_doc = get_document_by_id(vault_doc_id) if vault_doc_id else None
        minutes = finalize_assembly_minutes(assembly, content_summary, vault_doc)
        return Response(AssemblyMinutesSerializer(minutes).data, status=status.HTTP_200_OK)
