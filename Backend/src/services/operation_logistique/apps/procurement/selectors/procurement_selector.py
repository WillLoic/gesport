from typing import Optional
from django.db.models import QuerySet
from apps.procurement.models import Supplier, PurchaseOrder


def get_all_suppliers(active_only: bool = True) -> QuerySet[Supplier]:
    qs = Supplier.objects.all()
    if active_only:
        qs = qs.filter(is_active=True)
    return qs


def get_supplier_by_id(supplier_id: int) -> Optional[Supplier]:
    return Supplier.objects.filter(id=supplier_id).first()


def get_all_purchase_orders(status: Optional[str] = None) -> QuerySet[PurchaseOrder]:
    qs = PurchaseOrder.objects.select_related('supplier').prefetch_related('items').all()
    if status:
        qs = qs.filter(status=status)
    return qs


def get_purchase_order_by_id(po_id: int) -> Optional[PurchaseOrder]:
    return PurchaseOrder.objects.select_related('supplier').prefetch_related('items').filter(id=po_id).first()

