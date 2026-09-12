"""Modèles Order et OrderItem — Commandes clients et lignes de commande."""

import uuid
from django.db import models
from apps.inventory_variants.models.variant import ProductVariant
from apps.custom_prints.models.print_detail import CustomPrintDetail


class Order(models.Model):
    """Commande passée sur la boutique d'un club."""

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'En attente de paiement'
        PAID = 'PAID', 'Payée'
        PROCESSING = 'PROCESSING', 'En cours de préparation'
        SHIPPED = 'SHIPPED', 'Expédiée'
        DELIVERED = 'DELIVERED', 'Livrée'
        CANCELLED = 'CANCELLED', 'Annulée'

    order_number = models.CharField(
        max_length=64,
        unique=True,
        db_index=True,
        default=uuid.uuid4,
        help_text="Numéro unique de commande (ex: ORD-2026-XXXX)"
    )
    club_id = models.BigIntegerField(db_index=True, help_text="ID du club bénéficiaire")
    user_id = models.BigIntegerField(null=True, blank=True, help_text="ID de l'acheteur (IAM) si connecté")

    customer_name = models.CharField(max_length=255, help_text="Nom complet de l'acheteur")
    customer_email = models.EmailField(help_text="Email de l'acheteur")
    customer_phone = models.CharField(max_length=50, blank=True, default="")
    shipping_address = models.TextField(help_text="Adresse postale complète de livraison")

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, help_text="Sous-total hors livraison")
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Frais de livraison")
    total_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Montant total TTC payé")
    currency = models.CharField(max_length=10, default='EUR')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'shop_orders'
        ordering = ['-created_at']
        verbose_name = "Commande"
        verbose_name_plural = "Commandes"

    def __str__(self) -> str:
        return f"Commande #{self.order_number[:8]} - {self.customer_name} ({self.status})"


class OrderItem(models.Model):
    """Ligne d'une commande d'un article spécifique."""

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, related_name='order_items')
    
    product_name = models.CharField(max_length=255, help_text="Nom du produit sauvegardé à l'achat")
    variant_sku = models.CharField(max_length=100, help_text="SKU de la variante")
    
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Prix unitaire à l'achat")
    quantity = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Total pour cette ligne")

    print_detail = models.ForeignKey(
        CustomPrintDetail,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='order_items',
        help_text="Détail du flocage associé à cet article"
    )

    class Meta:
        db_table = 'shop_order_items'
        verbose_name = "Ligne de commande"
        verbose_name_plural = "Lignes de commande"

    def __str__(self) -> str:
        return f"{self.quantity}x {self.product_name} ({self.variant_sku}) dans Commande #{self.order.order_number[:8]}"
