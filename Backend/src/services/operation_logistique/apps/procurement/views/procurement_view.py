from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.procurement.serializers.procurement_serializer import SupplierSerializer, PurchaseOrderSerializer
from apps.procurement.selectors.procurement_selector import (
    get_all_suppliers, get_supplier_by_id, get_all_purchase_orders, get_purchase_order_by_id
)
from apps.procurement.services.procurement_service import (
    create_supplier, create_purchase_order, update_po_status
)


class SupplierListCreateView(APIView):
    """GET/POST /api/procurement/suppliers/"""

    def get(self, request):
        suppliers = get_all_suppliers()
        serializer = SupplierSerializer(suppliers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = SupplierSerializer(data=request.data)
        if serializer.is_valid():
            supplier = create_supplier(
                name=serializer.validated_data['name'],
                email=serializer.validated_data['email'],
                contact_person=serializer.validated_data.get('contact_person', ''),
                phone=serializer.validated_data.get('phone', ''),
                category=serializer.validated_data.get('category', 'Général'),
                address=serializer.validated_data.get('address', ''),
            )
            return Response(SupplierSerializer(supplier).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PurchaseOrderListCreateView(APIView):
    """GET/POST /api/procurement/purchase-orders/"""

    def get(self, request):
        po_status = request.query_params.get('status', None)
        orders = get_all_purchase_orders(status=po_status)
        serializer = PurchaseOrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        supplier_id = request.data.get('supplier')
        supplier = get_supplier_by_id(supplier_id) if supplier_id else None

        if not supplier:
            return Response({"error": "Fournisseur introuvable"}, status=status.HTTP_400_BAD_REQUEST)

        items_data = request.data.get('items', [])
        if not items_data:
            return Response({"error": "Au moins un article doit être fourni"}, status=status.HTTP_400_BAD_REQUEST)

        notes = request.data.get('notes', '')
        po = create_purchase_order(supplier=supplier, items_data=items_data, notes=notes)
        return Response(PurchaseOrderSerializer(po).data, status=status.HTTP_201_CREATED)


class PurchaseOrderUpdateStatusView(APIView):
    """POST /api/procurement/purchase-orders/<pk>/status/"""

    def post(self, request, pk: int):
        po = get_purchase_order_by_id(pk)
        if not po:
            return Response({"error": "Bon de commande introuvable"}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if not new_status:
            return Response({"error": "Nouveau statut requis"}, status=status.HTTP_400_BAD_REQUEST)

        updated = update_po_status(po=po, new_status=new_status)
        return Response(PurchaseOrderSerializer(updated).data, status=status.HTTP_200_OK)

