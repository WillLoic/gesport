"""Service d'intégration de l'API Geskap pour l'envoi de messages WhatsApp."""

import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class GeskapWhatsAppService:
    """Service d'envoi de messages WhatsApp (texte & médias libres) via l'API Geskap."""

    def __init__(self):
        self.api_key = getattr(settings, 'GESKAP_API_KEY', '')
        self.api_url = getattr(settings, 'GESKAP_API_URL', 'https://api.geskap.com/v1/whatsapp/send')

    def send_whatsapp_message(self, to_phone: str, text_content: str, media_url: str = None) -> dict:
        """Envoie un message WhatsApp avec texte et média optionnel."""
        if not self.api_key or self.api_key.startswith('mock'):
            logger.info(f"[MOCK GESKAP WHATSAPP] Mock send to {to_phone} with content '{text_content[:30]}...' media={media_url}")
            return {"success": True, "message_id": f"mock_wa_{to_phone}"}

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "to": to_phone,
            "message": text_content,
        }
        if media_url:
            payload["media_url"] = media_url

        try:
            response = requests.post(self.api_url, json=payload, headers=headers, timeout=10)
            if response.status_code in (200, 201, 202):
                data = response.json()
                return {"success": True, "message_id": data.get("id", data.get("message_id", "wa_sent"))}
            else:
                logger.error(f"Erreur Geskap WhatsApp [{response.status_code}]: {response.text}")
                return {"success": False, "error": response.text}
        except Exception as e:
            logger.exception("Exception lors de l'envoi WhatsApp via Geskap")
            return {"success": False, "error": str(e)}
