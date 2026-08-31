from decimal import Decimal
from django.db import transaction as db_transaction
from apps.invoicing.models.invoice import Invoice, InvoiceItem, Quote


def create_quote(*, club_id: int, reference: str, client_name: str, issue_date, validity_date, amount_excl_tax: Decimal, **kwargs) -> Quote:
    return Quote.objects.create(
        club_id=club_id, reference=reference, client_name=client_name,
        issue_date=issue_date, validity_date=validity_date,
        amount_excl_tax=amount_excl_tax, **kwargs
    )


@db_transaction.atomic
def create_invoice(*, club_id: int, number: str, client_name: str, issue_date, due_date, amount_excl_tax: Decimal, **kwargs) -> Invoice:
    """Crée une facture avec calcul automatique TVA + TTC (IFRS 15)."""
    return Invoice.objects.create(
        club_id=club_id, number=number, client_name=client_name,
        issue_date=issue_date, due_date=due_date,
        amount_excl_tax=amount_excl_tax, **kwargs
    )


def add_invoice_item(*, invoice: Invoice, description: str, quantity: Decimal, unit_price: Decimal) -> InvoiceItem:
    return InvoiceItem.objects.create(invoice=invoice, description=description, quantity=quantity, unit_price=unit_price)


def mark_invoice_paid(*, invoice: Invoice) -> Invoice:
    invoice.status = 'paid'
    invoice.save(update_fields=['status'])
    return invoice


def convert_quote_to_invoice(*, quote: Quote, invoice_number: str, due_date) -> Invoice:
    """Convertit un devis accepté en facture (IFRS 15 — obligation de prestation satisfaite)."""
    return create_invoice(
        club_id=quote.club_id,
        number=invoice_number,
        client_name=quote.client_name,
        client_email=quote.client_email,
        issue_date=quote.issue_date,
        due_date=due_date,
        amount_excl_tax=quote.amount_excl_tax,
        tax_rate=quote.tax_rate,
        quote=quote,
    )
