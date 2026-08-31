from django.test import TestCase
from apps.vault.models import VaultDocument, DocumentAccessLog, ConfidentialityLevel
from apps.vault.services.vault_service import upload_vault_document, generate_presigned_url


class VaultTestCase(TestCase):
    def test_upload_document(self):
        doc = upload_vault_document(
            title="Statuts du Club.pdf",
            file_path_or_s3_key="documents/statuts_2026.pdf",
            confidentiality_level=ConfidentialityLevel.RESTRICTED,
            uploaded_by="admin@gesport.com"
        )
        self.assertEqual(doc.title, "Statuts du Club.pdf")
        self.assertTrue(len(doc.sha256_hash) > 0)
        self.assertEqual(doc.confidentiality_level, ConfidentialityLevel.RESTRICTED)

    def test_generate_presigned_url_and_logs(self):
        doc = upload_vault_document(
            title="Rapport Financier 2026.pdf",
            file_path_or_s3_key="documents/rapport_2026.pdf"
        )
        res = generate_presigned_url(doc, accessed_by="user_123", ip_address="192.168.1.50")
        self.assertIn("presigned_url", res)
        self.assertEqual(res["document_id"], doc.id)

        logs = DocumentAccessLog.objects.filter(document=doc)
        self.assertEqual(logs.count(), 1)
        self.assertEqual(logs.first().accessed_by, "user_123")
