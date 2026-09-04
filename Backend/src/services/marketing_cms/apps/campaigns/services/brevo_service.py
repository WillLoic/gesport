"""Service d'intégration de l'API Brevo pour les e-mails et SMS marketing/transactionnels."""

import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class BrevoService:
    """Service d'envoi d'e-mails et SMS via Brevo (ex-Sendinblue)."""

    def __init__(self):
        self.api_key = getattr(settings, 'BREVO_API_KEY', '')
        self.sender_email = getattr(settings, 'BREVO_SENDER_EMAIL', 'no-reply@gesport.com')
        self.sender_name = getattr(settings, 'BREVO_SENDER_NAME', 'GESPORT Club')
        self.base_url = "https://api.brevo.com/v3"

    def send_email(self, to_email: str, subject: str, content: str) -> dict:
        """Envoie un e-mail individuel via l'API Brevo."""
        if not self.api_key or self.api_key.startswith('mock'):
            logger.info(f"[MOCK BREVO EMAIL] Mock send to {to_email} with subject '{subject}'")
            return {"success": True, "message_id": f"mock_email_{to_email}"}

        url = f"{self.base_url}/smtp/email"
        headers = {
            "api-key": self.api_key,
            "accept": "application/json",
            "content-type": "application/json"
        }
        payload = {
            "sender": {"name": self.sender_name, "email": self.sender_email},
            "to": [{"email": to_email}],
            "subject": subject,
            "htmlContent": content
        }

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            if response.status_code in (200, 201, 202):
                data = response.json()
                return {"success": True, "message_id": data.get("messageId")}
            else:
                logger.error(f"Erreur Brevo Email [{response.status_code}]: {response.text}")
                return {"success": False, "error": response.text}
        except Exception as e:
            logger.exception("Exception lors de l'envoi d'email via Brevo")
            return {"success": False, "error": str(e)}

    def send_sms(self, to_phone: str, content: str) -> dict:
        """Envoie un SMS individuel via l'API Brevo."""
        if not self.api_key or self.api_key.startswith('mock'):
            logger.info(f"[MOCK BREVO SMS] Mock SMS to {to_phone}")
            return {"success": True, "message_id": f"mock_sms_{to_phone}"}

        url = f"{self.base_url}/transactionalSMS/send-sms"
        headers = {
            "api-key": self.api_key,
            "accept": "application/json",
            "content-type": "application/json"
        }
        payload = {
            "type": "transactional",
            "unicodeEnabled": True,
            "recipient": to_phone,
            "sender": "GESPORT",
            "content": content
        }

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            if response.status_code in (200, 201, 202):
                data = response.json()
                return {"success": True, "message_id": str(data.get("reference", "sms_ok"))}
            else:
                logger.error(f"Erreur Brevo SMS [{response.status_code}]: {response.text}")
                return {"success": False, "error": response.text}
        except Exception as e:
            logger.exception("Exception lors de l'envoi de SMS via Brevo")
            return {"success": False, "error": str(e)}
