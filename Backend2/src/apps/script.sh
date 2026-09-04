#!/usr/bin/env bash

# Liste des 17 micro-apps métier
apps=(
  "01_iam"
  "02_members"
  "03_sport_performance"
  "04_academy"
  "05_medical"
  "06_recruitment"
  "07_finance_ledger"
  "08_invoicing"
  "09_sponsorship"
  "10_inventory"
  "11_fleet"
  "12_procurement"
  "13_staff_hr"
  "14_governance_vault"
  "15_shop_merch"
  "16_communication"
  "17_messaging"
)

echo "⏳ Création de l'arborescence des services dans src/apps/..."

# 1. Création des dossiers et fichiers de base pour chaque app
for app in "${apps[@]}"; do
  mkdir -p "${app}/models"
  mkdir -p "${app}/serializers"
  mkdir -p "${app}/views"
  mkdir -p "${app}/services"
  mkdir -p "${app}/selectors"
  mkdir -p "${app}/tests"

  touch "${app}/__init__.py"
  touch "${app}/apps.py"
  touch "${app}/urls.py"
  touch "${app}/permissions.py"
  touch "${app}/tasks.py"

  touch "${app}/models/__init__.py"
  touch "${app}/serializers/__init__.py"
  touch "${app}/views/__init__.py"
  touch "${app}/services/__init__.py"
  touch "${app}/selectors/__init__.py"
  touch "${app}/tests/__init__.py"
done

# 2. Fichiers spécifiques pour 01_iam
touch 01_iam/models/user.py
touch 01_iam/models/club.py
touch 01_iam/models/role.py
touch 01_iam/models/season.py
touch 01_iam/serializers/auth_serializer.py
touch 01_iam/serializers/user_serializer.py
touch 01_iam/views/auth_views.py
touch 01_iam/views/user_views.py
touch 01_iam/services/auth_service.py
touch 01_iam/services/user_service.py

# 3. Fichiers spécifiques pour 02_members
touch 02_members/models/member.py
touch 02_members/models/license.py
touch 02_members/models/subscription.py

# 4. Fichiers spécifiques pour 03_sport_performance
touch 03_sport_performance/models/team.py
touch 03_sport_performance/models/training.py
touch 03_sport_performance/models/match.py
touch 03_sport_performance/models/convocatoria.py
touch 03_sport_performance/models/tactic_board.py

# 5. Fichiers spécifiques pour 05_medical
touch 05_medical/models/injury.py
touch 05_medical/models/care_protocol.py
touch 05_medical/models/medical_clearance.py

# 6. Fichiers spécifiques pour 06_recruitment
touch 06_recruitment/models/prospect.py
touch 06_recruitment/models/scout_report.py
touch 06_recruitment/models/trial_session.py

# 7. Fichiers spécifiques pour 07_finance_ledger
touch 07_finance_ledger/models/account.py
touch 07_finance_ledger/models/transaction.py
touch 07_finance_ledger/models/bank_reconciliation.py

# 8. Fichiers spécifiques pour 08_invoicing
touch 08_invoicing/models/invoice.py
touch 08_invoicing/models/invoice_item.py

# 9. Fichiers spécifiques pour 09_sponsorship
touch 09_sponsorship/models/sponsor.py
touch 09_sponsorship/models/contract.py
touch 09_sponsorship/models/tax_receipt.py

# 10. Fichiers spécifiques pour 10_inventory
touch 10_inventory/models/equipment.py
touch 10_inventory/models/storage_location.py
touch 10_inventory/models/loan.py

# 11. Fichiers spécifiques pour 11_fleet
touch 11_fleet/models/vehicle.py
touch 11_fleet/models/vehicle_booking.py

# 12. Fichiers spécifiques pour 12_procurement
touch 12_procurement/models/supplier.py
touch 12_procurement/models/purchase_order.py

# 13. Fichiers spécifiques pour 13_staff_hr
touch 13_staff_hr/models/staff_member.py
touch 13_staff_hr/models/employment_contract.py
touch 13_staff_hr/models/leave_request.py

# 14. Fichiers spécifiques pour 14_governance_vault
touch 14_governance_vault/models/general_meeting.py
touch 14_governance_vault/models/official_document.py

# 15. Fichiers spécifiques pour 15_shop_merch
touch 15_shop_merch/models/product.py
touch 15_shop_merch/models/product_variant.py
touch 15_shop_merch/models/shop_order.py

# 16. Fichiers spécifiques pour 16_communication
touch 16_communication/models/news_article.py
touch 16_communication/models/marketing_campaign.py

# 17. Fichiers spécifiques pour 17_messaging (WebSockets Django Channels)
touch 17_messaging/routing.py
touch 17_messaging/consumers.py
touch 17_messaging/models/chat_channel.py
touch 17_messaging/models/chat_message.py
touch 17_messaging/models/notification.py

# 18. Création du module shared/
mkdir -p shared/utils
touch shared/__init__.py
touch shared/models.py
touch shared/permissions.py
touch shared/exceptions.py
touch shared/pagination.py
touch shared/utils/__init__.py
touch shared/utils/pdf_builder.py
touch shared/utils/string_helpers.py

echo "✅ Arborescence créée avec succès dans src/apps/ !"