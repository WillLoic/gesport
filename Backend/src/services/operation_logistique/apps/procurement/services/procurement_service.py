from datetime import date
from decimal import Decimal
from typing import List, Dict, Any, Optional
from django.db import transaction
from apps.procurement.models import Supplier, PurchaseOrder, OrderItem, PurchaseOrderStatus


def create_supplier(
    name: str,
    email: str,
    contact_person: str = '',
    phone: str = '',
    category: str = 'Général',
    address: str = '',
) -> Supplier:
    return Supplier.objects.create(
        name=name,
        email=email,
        contact_person=contact_person,
        phone=phone,
        category=category,
        address=address,
    )


def generate_po_number() -> str:
    year = date.today().year
    count = PurchaseOrder.objects.filter(order_date__year=year).count() + 1
    return f"BC-{year}-{count:04d}"


@transaction.atomic
def create_purchase_order(
    supplier: Supplier,
    items_data: List[Dict[str, Any]],
    notes: str = '',
) -> PurchaseOrder:
    po_number = generate_po_number()
    po = PurchaseOrder.objects.create(
        po_number=po_number,
        supplier=supplier,
        notes=notes,
        status=PurchaseOrderStatus.DRAFT,
    )

    total_amount = Decimal('0.00')
    for item in items_data:
        order_item = OrderItem.objects.create(
            purchase_order=po,
            description=item['description'],
            quantity=item.get('quantity', 1),
            unit_price=Decimal(str(item['unit_price'])),
        )
        total_amount += order_item.total_price

    po.total_amount = total_amount
    po.save()

    return po


@transaction.atomic
def update_po_status(po: PurchaseOrder, new_status: str) -> PurchaseOrder:
    po.status = new_status
    po.save()
    return po

