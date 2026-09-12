"""Vues API pour la gestion des options de flocage."""

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.custom_prints.models.option import CustomPrintOption
from apps.custom_prints.selectors.custom_print_selector import list_print_options_by_club, get_print_option_by_id
from apps.custom_prints.serializers.custom_print_serializer import CustomPrintOptionSerializer
from apps.custom_prints.services.custom_print_service import (
    create_print_option, update_print_option, delete_print_option,
)


class CustomPrintOptionListCreateView(APIView):
    """GET : lister les options de flocage d'un club. POST : créer une option."""
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        club_id = request.query_params.get('club_id', 1)
        options = list_print_options_by_club(int(club_id))
        return Response(CustomPrintOptionSerializer(options, many=True).data)

    def post(self, request: Request) -> Response:
        serializer = CustomPrintOptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        opt = create_print_option(**serializer.validated_data)
        return Response(CustomPrintOptionSerializer(opt).data, status=status.HTTP_201_CREATED)


class CustomPrintOptionDetailView(APIView):
    """GET / PUT / DELETE une option de flocage."""
    permission_classes = [AllowAny]

    def get(self, request: Request, pk: int) -> Response:
        try:
            opt = get_print_option_by_id(pk)
        except CustomPrintOption.DoesNotExist:
            return Response({"detail": "Option de flocage introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(CustomPrintOptionSerializer(opt).data)

    def put(self, request: Request, pk: int) -> Response:
        try:
            opt = update_print_option(option_id=pk, **request.data)
        except CustomPrintOption.DoesNotExist:
            return Response({"detail": "Option de flocage introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(CustomPrintOptionSerializer(opt).data)

    def delete(self, request: Request, pk: int) -> Response:
        try:
            delete_print_option(option_id=pk)
        except CustomPrintOption.DoesNotExist:
            return Response({"detail": "Option de flocage introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
