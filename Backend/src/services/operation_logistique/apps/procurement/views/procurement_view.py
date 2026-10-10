from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.utils import timezone
from ..models import PurchaseOrder, PurchaseOrderStatus
from ..serializers import PurchaseOrderSerializer

class PurchaseOrderListCreateView(generics.ListCreateAPIView):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        current_year = timezone.now().year
        count = PurchaseOrder.objects.filter(created_at__year=current_year).count() + 1
        code = f"BC-{current_year}-{str(count).zfill(3)}"

        # Check if code already exists to avoid conflict
        while PurchaseOrder.objects.filter(code=code).exists():
            count += 1
            code = f"BC-{current_year}-{str(count).zfill(3)}"

        serializer.save(code=code)


class PurchaseOrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer
    permission_classes = [AllowAny]


class PurchaseOrderValidateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, pk=None):
        try:
            order = PurchaseOrder.objects.get(pk=pk)
            order.status = PurchaseOrderStatus.APPROVED
            order.save()
            serializer = PurchaseOrderSerializer(order)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except PurchaseOrder.DoesNotExist:
            return Response({"detail": "Bon de commande introuvable."}, status=status.HTTP_404_NOT_FOUND)
