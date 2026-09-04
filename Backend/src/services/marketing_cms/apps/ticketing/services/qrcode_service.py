"""Service de génération et vérification de QR Codes et signatures sécurisées pour les billets."""

import hmac
import hashlib
import json
import base64
from django.conf import settings


def generate_ticket_signature(ticket_code, event_id: int) -> str:
    """Génère une signature HMAC-SHA256 infalsifiable pour un billet."""
    secret = getattr(settings, 'SECRET_KEY', 'default_cms_secret_key').encode('utf-8')
    message = f"GESPORT_TICKET:{str(ticket_code)}:{event_id}".encode('utf-8')
    signature = hmac.new(secret, message, hashlib.sha256).hexdigest()
    return signature


def generate_qr_code_payload(ticket_code, event_id: int, buyer_name: str) -> str:
    """Génère le payload JSON encodé qui sera scanné par l'application portique/contrôleur."""
    signature = generate_ticket_signature(ticket_code, event_id)
    payload = {
        "code": str(ticket_code),
        "event_id": event_id,
        "name": buyer_name,
        "sig": signature[:16]
    }
    return json.dumps(payload)


def verify_ticket_signature(ticket_code, event_id: int, signature_snippet: str) -> bool:
    """Vérifie l'authenticité de la signature HMAC du billet."""
    expected_sig = generate_ticket_signature(ticket_code, event_id)
    return hmac.compare_digest(expected_sig[:16], signature_snippet[:16])
