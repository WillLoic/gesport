import io
from decimal import Decimal
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm, mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
)
from reportlab.pdfgen import canvas
from ..models import PurchaseOrder


class NumberedCanvas(canvas.Canvas):
    """Canvas personnalisé pour ajouter la pagination 'Page X sur Y' et le footer."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Ligne de séparation footer
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(40, 35, 555, 35)

        # Texte footer
        self.drawString(40, 24, "GeSport Pro — ERP Omnisports | Service Opérations & Logistique")
        self.drawRightString(555, 24, f"Page {self._pageNumber} sur {page_count}")
        self.restoreState()


def generate_purchase_order_pdf(order: PurchaseOrder) -> bytes:
    """
    Génère un bon de commande officiel au format PDF avec ReportLab.
    Retourne les octets (bytes) du PDF généré.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=45,
    )

    styles = getSampleStyleSheet()

    # Styles personnalisés
    header_title_style = ParagraphStyle(
        'HeaderTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0F172A"),
    )

    header_sub_style = ParagraphStyle(
        'HeaderSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#2563EB"),
    )

    doc_badge_style = ParagraphStyle(
        'DocBadge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        alignment=2,  # Align right
        textColor=colors.HexColor("#1E293B"),
    )

    label_style = ParagraphStyle(
        'MetaLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        textColor=colors.HexColor("#64748B"),
        leading=11,
    )

    val_style = ParagraphStyle(
        'MetaValue',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        textColor=colors.HexColor("#0F172A"),
        leading=13,
    )

    th_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        textColor=colors.white,
        leading=12,
    )

    td_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        textColor=colors.HexColor("#1E293B"),
        leading=13,
    )

    td_bold_style = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        textColor=colors.HexColor("#0F172A"),
        leading=13,
    )

    story = []

    # 1. En-tête : Titre GeSport & Document
    header_data = [
        [
            Paragraph("<b>GeSport Pro</b><br/><font color='#475569' size='9'>Club Omnisports & Académie</font>", header_title_style),
            Paragraph(f"<b>BON DE COMMANDE</b><br/><font color='#2563EB' size='11'><b>{order.code}</b></font>", doc_badge_style),
        ]
    ]
    header_table = Table(header_data, colWidths=[320, 203])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(header_table)

    story.append(Spacer(1, 12))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#2563EB"), spaceBefore=0, spaceAfter=14))

    # 2. Informations de Commande & Fournisseur
    status_color = "#10B981" if order.status == "Validé" else "#F59E0B"
    date_str = order.request_date.strftime("%d/%m/%Y") if hasattr(order.request_date, 'strftime') else str(order.request_date)

    meta_data = [
        [
            Paragraph("<b>DÉTAILS DU BON</b>", header_sub_style),
            Paragraph("<b>FOURNISSEUR & LIVRAISON</b>", header_sub_style),
        ],
        [
            Paragraph(f"<b>Date de demande :</b> {date_str}<br/>"
                      f"<b>Demandé par :</b> {order.requested_by}<br/>"
                      f"<b>Statut :</b> <font color='{status_color}'><b>{order.status}</b></font>", val_style),
            Paragraph(f"<b>Fournisseur :</b> <b>{order.supplier_name}</b><br/>"
                      f"<b>Catégorie :</b> {order.category}<br/>"
                      f"<b>Facture jointe :</b> {'Oui' if order.invoice_attached else 'Non'}", val_style),
        ]
    ]

    meta_table = Table(meta_data, colWidths=[260, 263])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#E2E8F0")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(meta_table)

    story.append(Spacer(1, 16))

    # 3. Tableau des Articles / Description
    items_header = [
        Paragraph("<b>Désignation & Objet de la Commande</b>", th_style),
        Paragraph("<b>Catégorie</b>", th_style),
        Paragraph("<b>Montant TTC</b>", th_style),
    ]

    amount_ttc = Decimal(str(order.total_amount_ttc))
    amount_ht = (amount_ttc / Decimal("1.20")).quantize(Decimal("0.01"))
    tva = (amount_ttc - amount_ht).quantize(Decimal("0.01"))

    items_row = [
        Paragraph(order.description.replace("\n", "<br/>"), td_style),
        Paragraph(order.category, td_style),
        Paragraph(f"<b>{amount_ttc:,.2f} €</b>".replace(",", " ").replace(".", ","), td_bold_style),
    ]

    items_table = Table([items_header, items_row], colWidths=[310, 120, 93])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1E293B")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0, 0), (-1, -1), 7),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(items_table)

    story.append(Spacer(1, 12))

    # 4. Récapitulatif Financier (HT / TVA / TTC)
    summary_data = [
        [Paragraph("Montant Total HT (TVA 20% incluse) :", label_style), Paragraph(f"{amount_ht:,.2f} €".replace(",", " ").replace(".", ","), val_style)],
        [Paragraph("Montant TVA (20%) :", label_style), Paragraph(f"{tva:,.2f} €".replace(",", " ").replace(".", ","), val_style)],
        [Paragraph("<b>TOTAL GÉNÉRAL TTC :</b>", td_bold_style), Paragraph(f"<b>{amount_ttc:,.2f} €</b>".replace(",", " ").replace(".", ","), header_sub_style)],
    ]
    summary_table = Table(summary_data, colWidths=[380, 143])
    summary_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor("#EFF6FF")),
        ('BOX', (0, 2), (-1, 2), 1, colors.HexColor("#93C5FD")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(summary_table)

    story.append(Spacer(1, 24))

    # 5. Bloc Signatures & Visa Trésorerie
    sign_valide = order.status == "Validé"
    visa_treasury_text = (
        "<b>VISA TRÉSORERIE / DIRECTION DU CLUB</b><br/>"
        f"<font color='#059669'><b>[✓] BON DE COMMANDE VALIDÉ</b></font><br/>"
        "Engagement budgétaire approuvé pour paiement."
        if sign_valide else
        "<b>VISA TRÉSORERIE / DIRECTION DU CLUB</b><br/>"
        f"<font color='#D97706'><b>[ ! ] EN ATTENTE DE VALIDATION</b></font><br/>"
        "Signature requise avant émission au fournisseur."
    )

    signatures_data = [
        [
            Paragraph("<b>VISA DU DEMANDEUR</b><br/>"
                      f"Responsable : <i>{order.requested_by}</i><br/><br/>"
                      "Date et signature : ........................................", td_style),
            Paragraph(visa_treasury_text, td_style),
        ]
    ]

    signatures_table = Table(signatures_data, colWidths=[260, 263])
    signatures_table.setStyle(TableStyle([
        ('BOX', (0, 0), (0, 0), 1, colors.HexColor("#CBD5E1")),
        ('BOX', (1, 0), (1, 0), 1, colors.HexColor("#10B981") if sign_valide else colors.HexColor("#F59E0B")),
        ('BACKGROUND', (0, 0), (0, 0), colors.HexColor("#F8FAFC")),
        ('BACKGROUND', (1, 0), (1, 0), colors.HexColor("#F0FDF4") if sign_valide else colors.HexColor("#FFFBEB")),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(signatures_table)

    # Construction du document avec Canvas numéroté
    doc.build(story, canvasmaker=NumberedCanvas)
    pdf = buffer.getvalue()
    buffer.close()
    return pdf
