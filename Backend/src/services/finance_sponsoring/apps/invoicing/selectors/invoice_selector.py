from django.db.models import QuerySet
from apps.invoicing.models.invoice import Quote, Invoice


def list_invoices(club_id: int, *, status: str = None) -> QuerySet:
    qs = Invoice.objects.filter(club_id=club_id).prefetch_related('items')
    if status:
        qs = qs.filter(status=status)
    return qs.order_by('-issue_date')


def list_quotes(club_id: int) -> QuerySet:
    return Quote.objects.filter(club_id=club_id).order_by('-issue_date')
