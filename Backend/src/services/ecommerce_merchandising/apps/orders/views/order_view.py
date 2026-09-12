"""Vues API pour les paniers et commandes."""

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders.models.cart import Cart
from apps.orders.models.order import Order
from apps.orders.selectors.order_selector import (
    get_or_create_cart, list_orders_by_club, get_order_by_id, get_order_by_number,
)
from apps.orders.serializers.order_serializer import (
    CartSerializer, CartItemSerializer, OrderSerializer,
    AddToCartRequestSerializer, CheckoutRequestSerializer,
)
from apps.orders.services.cart_service import add_item_to_cart, update_cart_item, remove_item_from_cart, clear_cart
from apps.orders.services.order_service import create_order_from_cart, update_order_status


class CartView(APIView):
    """GET : consulter le panier. POST : ajouter un article au panier. DELETE : vider le panier."""
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        session_id = request.query_params.get('session_id', 'demo_session')
        club_id = request.query_params.get('club_id', 1)
        cart = get_or_create_cart(session_id, int(club_id))
        return Response(CartSerializer(cart).data)

    def post(self, request: Request) -> Response:
        session_id = request.data.get('session_id', 'demo_session')
        club_id = request.data.get('club_id', 1)
        cart = get_or_create_cart(session_id, int(club_id))

        serializer = AddToCartRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            item = add_item_to_cart(
                cart=cart,
                variant_id=serializer.validated_data['variant_id'],
                quantity=serializer.validated_data.get('quantity', 1),
                custom_print_data=serializer.validated_data.get('custom_print')
            )
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        cart.refresh_from_db()
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)

    def delete(self, request: Request) -> Response:
        session_id = request.query_params.get('session_id', 'demo_session')
        club_id = request.query_params.get('club_id', 1)
        cart = get_or_create_cart(session_id, int(club_id))
        clear_cart(cart=cart)
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class CartItemDetailView(APIView):
    """PUT / DELETE un article du panier."""
    permission_classes = [AllowAny]

    def put(self, request: Request, pk: int) -> Response:
        quantity = request.data.get('quantity', 1)
        try:
            item = update_cart_item(cart_item_id=pk, quantity=int(quantity))
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        if item:
            return Response(CartItemSerializer(item).data)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def delete(self, request: Request, pk: int) -> Response:
        remove_item_from_cart(cart_item_id=pk)
        return Response(status=status.HTTP_204_NO_CONTENT)


class OrderListCreateView(APIView):
    """GET : lister les commandes d'un club. POST : valider le checkout et créer une commande."""
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        club_id = request.query_params.get('club_id', 1)
        order_status = request.query_params.get('status')
        orders = list_orders_by_club(int(club_id), status=order_status)
        return Response(OrderSerializer(orders, many=True).data)

    def post(self, request: Request) -> Response:
        serializer = CheckoutRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart = get_or_create_cart(
            session_id=serializer.validated_data['session_id'],
            club_id=serializer.validated_data['club_id']
        )

        try:
            order = create_order_from_cart(
                cart=cart,
                customer_name=serializer.validated_data['customer_name'],
                customer_email=serializer.validated_data['customer_email'],
                customer_phone=serializer.validated_data.get('customer_phone', ''),
                shipping_address=serializer.validated_data['shipping_address'],
                shipping_cost=serializer.validated_data.get('shipping_cost', 0)
            )
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetailView(APIView):
    """GET : détails d'une commande par ID ou Numéro."""
    permission_classes = [AllowAny]

    def get(self, request: Request, identifier: str) -> Response:
        try:
            if identifier.isdigit():
                order = get_order_by_id(int(identifier))
            else:
                order = get_order_by_number(identifier)
        except Order.DoesNotExist:
            return Response({"detail": "Commande introuvable."}, status=status.HTTP_404_NOT_FOUND)

        return Response(OrderSerializer(order).data)


class OrderStatusUpdateView(APIView):
    """PUT : mise à jour du statut d'une commande (ex: PENDING -> PAID ou SHIPPED)."""
    permission_classes = [AllowAny]

    def put(self, request: Request, pk: int) -> Response:
        new_status = request.data.get('status')
        if not new_status:
            return Response({"detail": "Le champ 'status' est requis."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = update_order_status(order_id=pk, new_status=new_status)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(OrderSerializer(order).data)
