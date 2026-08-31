"""
Vues REST API pour l'application sponsors.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.sponsors.serializers.sponsor_serializer import (
    SponsorSerializer, SponsorshipPackSerializer, SponsorshipContractSerializer
)
from apps.sponsors.selectors.sponsor_selector import (
    get_sponsors_for_club, get_sponsor_by_id,
    get_packs_for_club, get_contracts_for_club, get_contract_by_id
)
from apps.sponsors.services.sponsor_service import (
    create_sponsor, create_sponsorship_pack, create_sponsorship_contract,
    sign_sponsorship_contract, terminate_sponsorship_contract
)


class SponsorListCreateView(APIView):
    """GET/POST /api/v1/finance/sponsors/sponsors/"""

    def get(self, request):
        club_id = request.query_params.get('club_id', 1)
        sponsor_status = request.query_params.get('status', None)
        sponsors = get_sponsors_for_club(club_id=int(club_id), status=sponsor_status)
        serializer = SponsorSerializer(sponsors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = SponsorSerializer(data=request.data)
        if serializer.is_valid():
            sponsor = create_sponsor(
                club_id=serializer.validated_data['club_id'],
                company_name=serializer.validated_data['company_name'],
                contact_name=serializer.validated_data['contact_name'],
                contact_email=serializer.validated_data['contact_email'],
                sponsor_type=serializer.validated_data.get('sponsor_type', 'corporate'),
                siret=serializer.validated_data.get('siret', ''),
                contact_phone=serializer.validated_data.get('contact_phone', ''),
                website=serializer.validated_data.get('website', ''),
                logo_url=serializer.validated_data.get('logo_url', ''),
                status=serializer.validated_data.get('status', 'prospect'),
            )
            return Response(SponsorSerializer(sponsor).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SponsorshipPackListCreateView(APIView):
    """GET/POST /api/v1/finance/sponsors/packs/"""

    def get(self, request):
        club_id = request.query_params.get('club_id', 1)
        packs = get_packs_for_club(club_id=int(club_id))
        serializer = SponsorshipPackSerializer(packs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = SponsorshipPackSerializer(data=request.data)
        if serializer.is_valid():
            pack = create_sponsorship_pack(
                club_id=serializer.validated_data['club_id'],
                name=serializer.validated_data['name'],
                price=serializer.validated_data['price'],
                description=serializer.validated_data.get('description', ''),
                benefits=serializer.validated_data.get('benefits', ''),
            )
            return Response(SponsorshipPackSerializer(pack).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SponsorshipContractListCreateView(APIView):
    """GET/POST /api/v1/finance/sponsors/contracts/"""

    def get(self, request):
        club_id = request.query_params.get('club_id', 1)
        contract_status = request.query_params.get('status', None)
        contracts = get_contracts_for_club(club_id=int(club_id), status=contract_status)
        serializer = SponsorshipContractSerializer(contracts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        club_id = request.data.get('club_id', 1)
        sponsor_id = request.data.get('sponsor')
        sponsor = get_sponsor_by_id(club_id=int(club_id), sponsor_id=int(sponsor_id)) if sponsor_id else None

        if not sponsor:
            return Response({"error": "Sponsor introuvable"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = SponsorshipContractSerializer(data=request.data)
        if serializer.is_valid():
            contract = create_sponsorship_contract(
                club_id=int(club_id),
                sponsor=sponsor,
                start_date=serializer.validated_data['start_date'],
                end_date=serializer.validated_data['end_date'],
                amount=serializer.validated_data['amount'],
                pack=serializer.validated_data.get('pack'),
                notes=serializer.validated_data.get('notes', ''),
            )
            return Response(SponsorshipContractSerializer(contract).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SponsorshipContractSignView(APIView):
    """POST /api/v1/finance/sponsors/contracts/<pk>/sign/"""

    def post(self, request, pk: int):
        club_id = request.data.get('club_id', 1)
        contract = get_contract_by_id(club_id=int(club_id), contract_id=pk)
        if not contract:
            return Response({"error": "Contrat introuvable"}, status=status.HTTP_404_NOT_FOUND)

        signed = sign_sponsorship_contract(contract=contract)
        return Response(SponsorshipContractSerializer(signed).data, status=status.HTTP_200_OK)


class SponsorshipContractTerminateView(APIView):
    """POST /api/v1/finance/sponsors/contracts/<pk>/terminate/"""

    def post(self, request, pk: int):
        club_id = request.data.get('club_id', 1)
        contract = get_contract_by_id(club_id=int(club_id), contract_id=pk)
        if not contract:
            return Response({"error": "Contrat introuvable"}, status=status.HTTP_404_NOT_FOUND)

        terminated = terminate_sponsorship_contract(contract=contract)
        return Response(SponsorshipContractSerializer(terminated).data, status=status.HTTP_200_OK)

