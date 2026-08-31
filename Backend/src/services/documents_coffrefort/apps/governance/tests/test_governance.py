from django.test import TestCase
from django.utils import timezone
from apps.governance.models import ResolutionStatus, MinutesSignatureStatus
from apps.governance.services.governance_service import (
    create_assembly, send_convocations, add_resolution, vote_on_resolution, finalize_assembly_minutes
)


class GovernanceTestCase(TestCase):
    def test_assembly_creation_and_convocation(self):
        ag = create_assembly(
            title="Assemblée Générale Annuelle 2026",
            scheduled_at=timezone.now()
        )
        self.assertEqual(ag.title, "Assemblée Générale Annuelle 2026")

        convs = send_convocations(ag, ["president@gesport.com", "tresorier@gesport.com"])
        self.assertEqual(len(convs), 2)
        self.assertEqual(ag.convocations.count(), 2)

    def test_resolution_voting_passed(self):
        ag = create_assembly(title="AG Extraordinaire", scheduled_at=timezone.now())
        res = add_resolution(ag, "Approbation du budget prévisionnel 2027")

        res_voted = vote_on_resolution(res, votes_for=15, votes_against=2, votes_abstain=1)
        self.assertEqual(res_voted.status, ResolutionStatus.PASSED)
        self.assertEqual(res_voted.votes_for, 15)

    def test_resolution_voting_rejected(self):
        ag = create_assembly(title="AG Extraordinaire", scheduled_at=timezone.now())
        res = add_resolution(ag, "Modification des statuts")

        res_voted = vote_on_resolution(res, votes_for=3, votes_against=10, votes_abstain=0)
        self.assertEqual(res_voted.status, ResolutionStatus.REJECTED)

    def test_finalize_minutes(self):
        ag = create_assembly(title="AG Ordinaire", scheduled_at=timezone.now())
        minutes = finalize_assembly_minutes(ag, content_summary="Synthèse des décisions de l'AG")
        self.assertEqual(minutes.signed_pv_status, MinutesSignatureStatus.DRAFT)
        self.assertEqual(ag.status, "COMPLETED")
