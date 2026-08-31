# 🏟️ GESPORT - Système Intégré de Gestion de Club Omnisports

> **Plateforme tout-en-un de gestion sportive, financière, administrative, logistique et médicale pour clubs amateurs, semi-pros et professionnels multi-sports.**

---

## 📖 1. Présentation Générale

**GESPORT** est une solution complète conçue pour centraliser et digitaliser l'intégralité des opérations d'un club sportif. 
Elle résout le problème de la dispersion des outils (Excel pour les adhérents, WhatsApp pour les coachs, feuilles volantes pour les convocations, logiciel comptable séparé, etc.) en fournissant **une seule interface unifiée** et une **architecture backend microservices robuste**.

### 🌟 Fonctionnalités Clés par Pôle
- **⚽ Pôle Sportif & Performance** : Schémas tactiques interactifs multi-sports (Football, Basketball, Volleyball, Handball, Rugby, Tennis), convocations, feuilles de match, statistiques individuelles & MVP, académie/formation des jeunes, suivi médical (blessures/soins) et cellule de recrutement/scouting avec notation radar.
- **💶 Pôle Finance & Sponsoring** : Grand Livre comptable conforme FEC, rapprochement bancaire, facturation & devis avec calcul TVA, gestion des sponsors B2B et génération automatique des reçus fiscaux Cerfa (mécénat).
- **📦 Pôle Logistique & Opérations** : Inventaire du matériel avec alertes de stock mini, gestion des emprunts par QR code, planning de réservation de la flotte de minibus pour les déplacements et bons de commande fournisseurs.
- **👔 Pôle RH & Gouvernance** : Gestion du staff et des contrats, demandes de congés avec désignation du remplaçant, assemblées générales (AG) et coffre-fort numérique sécurisé pour les statuts et documents officiels.
- **🛍️ Pôle Commercial & Communication** : Boutique en ligne officielle avec flocages personnalisés, CMS d'actualités pour le site public, campagnes emailing/SMS ciblées et messagerie instantanée en temps réel.

---

## 🏗️ 2. Architecture Technique Globale

L'application repose sur un découpage moderne :
- **Frontend** : Application Single-Page (SPA) réactive en **React 18 + TypeScript + Tailwind CSS**.
- **API Gateway** : Reverse Proxy **Nginx / Kong** assurant le point d'entrée unique (Port `8000`), la sécurité et le routage intelligent des requêtes.
- **Backend** : Architecture en **8 Microservices Django REST / Django Ninja** autonomes.
- **Bases de Données** : **Database-per-Service Pattern** avec 8 instances **PostgreSQL** dédiées et isolées.
- **Temps Réel & Asynchronisme** : **Django Channels** (WebSockets) + **Celery** + **Redis Broker**.

```
                                  [ UTILISATEURS ]
                 (Président, Coachs, Joueurs, Parents, Trésorier)
                                         │
                                         ▼
                     [ FRONTEND REACT (Single-Page App) ]
                                         │
                                         ▼
                  [ API GATEWAY / REVERSE PROXY (Port 8000) ]
                                         │
 ┌──────────────┬──────────────┬─────────┴────┬──────────────┬──────────────┐
 ▼              ▼              ▼              ▼              ▼              ▼
[01_Auth]    [02_Sport]    [03_Ops]      [04_Finance]   [05_Shop]     [06_Chat] ...
(Port 8001)  (Port 8002)   (Port 8003)   (Port 8004)    (Port 8005)   (Port 8006)
 │              │              │              │              │              │
 ▼              ▼              ▼              ▼              ▼              ▼
[auth_db]    [sport_db]    [ops_db]      [finance_db]   [shop_db]     [chat_db]
```

---

## 🧩 3. Détail des 8 Microservices Métier

Chaque microservice est un projet Django autonome hébergeant ses propres sous-applications découplées :

| # | Microservice | Port | Base de Données | Sous-Applications Métier & Rôles |
|---|---|---|---|---|
| **01** | `auth_iam` | `8001` | `auth_db` | **`accounts`** (utilisateurs, profils, 2FA), **`clubs`** (multi-tenancy, saisons sportives), **`rbac`** (rôles & permissions). |
| **02** | `sport_perf` | `8002` | `sport_db` | **`members`** (licenciés, cotisations), **`teams`** (effectifs), **`competitions`** (matchs, convocations, stats), **`tactics`** (schémas), **`academy`** (suivi scolaire), **`medical`** (blessures, kiné), **`recruitment`** (scouting). |
| **03** | `operations_logistics` | `8003` | `ops_db` | **`inventory`** (matériel sportif), **`loans`** (emprunts coachs), **`fleet`** (minibus club), **`maintenance`** (contrôles techniques), **`procurement`** (achats & commandes). |
| **04** | `finance_sponsoring` | `8004` | `finance_db` | **`ledger`** (Grand Livre comptable), **`banking`** (rapprochement), **`invoicing`** (factures, devis), **`sponsors`** (contrats partenaires), **`tax_receipts`** (reçus Cerfa mécénat). |
| **05** | `ecommerce_merch` | `8005` | `shop_db` | **`catalog`** (produits, maillots), **`inventory_variants`** (tailles & stocks), **`custom_prints`** (flocages nom/numéro), **`orders`** (commandes & retraits), **`payments`** (Stripe/CB). |
| **06** | `messaging_notifications` | `8006` | `chat_db` | **`chat`** (salons publics d'équipes), **`direct_messages`** (DMs privés), **`channels_engine`** (WebSockets temps réel), **`notifications`** (push & in-app). |
| **07** | `marketing_cms` | `8007` | `cms_db` | **`news`** (articles & médias du site public), **`campaigns`** (emailing & SMS de masse), **`ticketing`** (billetterie des matchs). |
| **08** | `documents_vault` | `8008` | `vault_db` | **`vault`** (coffre-fort documentaire sécurisé), **`governance`** (assemblées générales & PV), **`signatures`** (signature électronique), **`hr_contracts`** (contrats & congés staff). |

---

## 🏛️ 4. Standard de Code Imposé pour les Développeurs

Pour garantir une lisibilité absolue et éviter les fichiers monstres, **chaque sous-application Django respecte l'architecture en couches stricte** :

```text
apps/nom_de_l_app/
├── models/             # Entités découpées (1 fichier par table, pas de models.py unique)
├── serializers/        # Validation et sérialisation des données d'entrée/sortie
├── views/              # Contrôleurs HTTP légers (réception requête -> renvoi réponse)
├── services/           # 💡 TOUTE LA LOGIQUE MÉTIER PURE (calculs, workflows, notifications)
├── selectors/          # 💡 TOUTES LES REQUÊTES SQL / ORM COMPLEXES (filtres, agrégations)
├── permissions.py      # Contrôles d'accès RBAC fins
├── tasks.py            # Tâches d'arrière-plan Celery asynchrones
└── tests/              # Tests unitaires et d'intégration
```

> **Règle d'or** : Une `view` ne doit jamais contenir de requêtes ORM complexes ni de règles de calcul métier. Elle appelle un `selector` pour lire la donnée ou un `service` pour exécuter une action.

---

## 🔒 5. Système de Sécurité & Rôles (RBAC)

Le système gère nativement des permissions granulaires adaptées aux structures sportives :

- **Président / Direction Générale (`SUPER_ADMIN`)** : Accès total en lecture/écriture à tous les modules du club.
- **Trésorier / Expert-Comptable (`TREASURER`)** : Gestion du Grand Livre, facturation, bons de commande et sponsoring.
- **Directeur Sportif / Head Coach (`COACH`)** : Convocations, compositions, schémas tactiques, académie et recrutement.
- **Médecin / Kinésithérapeute (`MEDICAL_STAFF`)** : Dossier médical des joueurs, soins et autorisations de reprise.
- **Responsable Matériel & Logistique (`LOGISTICS`)** : Gestion des minibus, stocks d'équipements et réceptions fournisseurs.
- **Joueur / Adhérent / Parent (`MEMBER`)** : Consultation de ses convocations, justificatifs de licence et boutique.

---

## 🚀 6. Installation & Démarrage Rapide

### Prérequis
- **Docker & Docker Compose** (version 20+)
- **Node.js 18+ & npm** (pour le frontend local)
- **Python 3.11+**

### Lancement avec Docker Compose (Stack Complète)

1. **Cloner le projet** :
   ```bash
   git clone https://github.com/votre-organisation/gesport.git
   cd gesport
   ```

2. **Configurer les variables d'environnement** :
   ```bash
   cp .env.example .env
   ```

3. **Lancer les 8 microservices, les 8 bases PostgreSQL, Redis et l'API Gateway** :
   ```bash
   docker compose up --build -d
   ```

4. **Appliquer les migrations initiales sur tous les services** :
   ```bash
   docker compose exec auth-service python manage.py migrate
   docker compose exec sport-service python manage.py migrate
   docker compose exec operations-service python manage.py migrate
   docker compose exec finance-service python manage.py migrate
   docker compose exec shop-service python manage.py migrate
   docker compose exec messaging-service python manage.py migrate
   docker compose exec marketing-service python manage.py migrate
   docker compose exec vault-service python manage.py migrate
   ```

5. **Accéder aux services** :
   - **Point d'entrée API Gateway** : `http://localhost:8000`
   - **Documentation Swagger interactive** : `http://localhost:8000/api/docs/`
   - **Frontend Web** : `http://localhost:3000`

---

## 📡 7. Tableau de Routage des Requêtes (API Gateway)

| Préfixe URL | Microservice Cible | Port Interne |
|---|---|---|
| `/api/v1/auth/` | `01_auth_iam` | `8001` |
| `/api/v1/sport/` | `02_sport_perf` | `8002` |
| `/api/v1/ops/` | `03_operations_logistics` | `8003` |
| `/api/v1/finance/` | `04_finance_sponsoring` | `8004` |
| `/api/v1/shop/` | `05_ecommerce_merch` | `8005` |
| `/api/v1/chat/` & `/ws/` | `06_messaging_notifications` | `8006` |
| `/api/v1/cms/` | `07_marketing_cms` | `8007` |
| `/api/v1/vault/` | `08_documents_vault` | `8008` |

---

## 🤝 8. Contribution & Bonnes Pratiques

- **Branches Git** : `feature/nom-du-service-fonctionnalite` (ex: `feature/sport-tactical-board`).
- **Tests obligatoires** : Chaque nouvelle règle métier dans `services/` doit être couverte par un test unitaire dans `tests/`.
- **Lint & Formatage** : Exécuter `black .` et `flake8` avant toute Pull Request.

---
© 2026 GESPORT - Tous droits réservés.
