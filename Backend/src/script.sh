#!/usr/bin/env bash

set -e

echo "🚀 Démarrage de la génération de l'architecture 8 Microservices..."

mkdir -p api-gateway
mkdir -p services

# Tableau : "Dossier_Service:Port:Nom_DB:Liste_Des_Apps_Séparées_Par_Espace"
declare -a microservices=(
  "01_auth_iam:8001:auth_db:accounts clubs rbac"
  "02_sport_perf:8002:sport_db:members teams competitions tactics academy medical recruitment"
  "03_operations_logistics:8003:ops_db:inventory loans fleet maintenance procurement"
  "04_finance_sponsoring:8004:finance_db:ledger banking invoicing sponsors tax_receipts"
  "05_ecommerce_merch:8005:shop_db:catalog inventory_variants custom_prints orders payments"
  "06_messaging_notifications:8006:chat_db:chat direct_messages channels_engine notifications"
  "07_marketing_cms:8007:cms_db:news campaigns ticketing"
  "08_documents_vault:8008:vault_db:vault governance signatures hr_contracts"
)

for item in "${microservices[@]}"; do
  IFS=':' read -r s_dir s_port s_db s_apps <<< "$item"

  echo "--------------------------------------------------------"
  echo "📦 Initialisation du Microservice : ${s_dir} (Port ${s_port} - DB ${s_db})"
  echo "--------------------------------------------------------"

  mkdir -p "services/${s_dir}"
  cd "services/${s_dir}"

  # 1. Initialise le projet Django autonome
  django-admin startproject config .

  # 2. Création du dossier racine des apps et shared
  mkdir -p apps
  mkdir -p shared/utils

  touch shared/__init__.py
  touch shared/models.py        # BaseModel avec created_at, updated_at
  touch shared/permissions.py   # Base permissions
  touch shared/exceptions.py    # Custom exceptions
  touch shared/pagination.py    # Standard pagination
  touch shared/utils/__init__.py

  # 3. Création des sous-apps modulaires
  for app in $s_apps; do
    echo "   ↳ Création de la sous-app : apps/${app}"
    mkdir -p "apps/${app}/models"
    mkdir -p "apps/${app}/serializers"
    mkdir -p "apps/${app}/views"
    mkdir -p "apps/${app}/services"
    mkdir -p "apps/${app}/selectors"
    mkdir -p "apps/${app}/tests"

    touch "apps/${app}/__init__.py"
    touch "apps/${app}/apps.py"
    touch "apps/${app}/urls.py"
    touch "apps/${app}/permissions.py"
    touch "apps/${app}/tasks.py"

    touch "apps/${app}/models/__init__.py"
    touch "apps/${app}/serializers/__init__.py"
    touch "apps/${app}/views/__init__.py"
    touch "apps/${app}/services/__init__.py"
    touch "apps/${app}/selectors/__init__.py"
    touch "apps/${app}/tests/__init__.py"
  done

  # 4. Dockerfile du microservice
  cat <<EOF > Dockerfile
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EOF

  # 5. requirements.txt
  cat <<EOF > requirements.txt
django>=5.0,<6.0
djangorestframework>=3.15.0
djangorestframework-simplejwt>=5.3.0
psycopg2-binary>=2.9.9
django-cors-headers>=4.3.0
celery>=5.3.0
redis>=5.0.0
channels>=4.0.0
daphne>=4.0.0
EOF

  cd ../../
done

# 6. Génération de l'API Gateway Nginx
echo "🚪 Configuration de l'API Gateway Nginx..."
cat <<'EOF' > api-gateway/nginx.conf
events {}

http {
    upstream auth_svc      { server auth-service:8001; }
    upstream sport_svc     { server sport-service:8002; }
    upstream ops_svc       { server operations-service:8003; }
    upstream finance_svc   { server finance-service:8004; }
    upstream shop_svc      { server shop-service:8005; }
    upstream chat_svc      { server messaging-service:8006; }
    upstream cms_svc       { server marketing-service:8007; }
    upstream vault_svc     { server vault-service:8008; }

    server {
        listen 8000;

        location /api/v1/auth/      { proxy_pass http://auth_svc; proxy_set_header Host $host; }
        location /api/v1/sport/     { proxy_pass http://sport_svc; proxy_set_header Host $host; }
        location /api/v1/ops/       { proxy_pass http://ops_svc; proxy_set_header Host $host; }
        location /api/v1/finance/   { proxy_pass http://finance_svc; proxy_set_header Host $host; }
        location /api/v1/shop/      { proxy_pass http://shop_svc; proxy_set_header Host $host; }
        location /api/v1/chat/      { proxy_pass http://chat_svc; proxy_set_header Host $host; }
        location /api/v1/cms/       { proxy_pass http://cms_svc; proxy_set_header Host $host; }
        location /api/v1/vault/     { proxy_pass http://vault_svc; proxy_set_header Host $host; }

        # WebSockets
        location /ws/ {
            proxy_pass http://chat_svc;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "Upgrade";
            proxy_set_header Host $host;
        }
    }
}
EOF

# 7. Génération du docker-compose.yml complet (8 DBs + 8 Services + Gateway + Redis)
echo "🐳 Génération du docker-compose.yml multi-services..."
cat <<'EOF' > docker-compose.yml
version: '3.8'

services:
  # --- BASES DE DONNÉES SÉPARÉES (PostgreSQL) ---
  db-auth:
    image: postgres:15-alpine
    environment: [POSTGRES_DB=auth_db, POSTGRES_USER=postgres, POSTGRES_PASSWORD=password]
    ports: ["5431:5432"]
    volumes: ["auth_data:/var/lib/postgresql/data"]

  db-sport:
    image: postgres:15-alpine
    environment: [POSTGRES_DB=sport_db, POSTGRES_USER=postgres, POSTGRES_PASSWORD=password]
    ports: ["5432:5432"]
    volumes: ["sport_data:/var/lib/postgresql/data"]

  db-ops:
    image: postgres:15-alpine
    environment: [POSTGRES_DB=ops_db, POSTGRES_USER=postgres, POSTGRES_PASSWORD=password]
    ports: ["5433:5432"]
    volumes: ["ops_data:/var/lib/postgresql/data"]

  db-finance:
    image: postgres:15-alpine
    environment: [POSTGRES_DB=finance_db, POSTGRES_USER=postgres, POSTGRES_PASSWORD=password]
    ports: ["5434:5432"]
    volumes: ["finance_data:/var/lib/postgresql/data"]

  db-shop:
    image: postgres:15-alpine
    environment: [POSTGRES_DB=shop_db, POSTGRES_USER=postgres, POSTGRES_PASSWORD=password]
    ports: ["5435:5432"]
    volumes: ["shop_data:/var/lib/postgresql/data"]

  db-chat:
    image: postgres:15-alpine
    environment: [POSTGRES_DB=chat_db, POSTGRES_USER=postgres, POSTGRES_PASSWORD=password]
    ports: ["5436:5432"]
    volumes: ["chat_data:/var/lib/postgresql/data"]

  db-cms:
    image: postgres:15-alpine
    environment: [POSTGRES_DB=cms_db, POSTGRES_USER=postgres, POSTGRES_PASSWORD=password]
    ports: ["5437:5432"]
    volumes: ["cms_data:/var/lib/postgresql/data"]

  db-vault:
    image: postgres:15-alpine
    environment: [POSTGRES_DB=vault_db, POSTGRES_USER=postgres, POSTGRES_PASSWORD=password]
    ports: ["5438:5432"]
    volumes: ["vault_data:/var/lib/postgresql/data"]

  # --- MESSAGE BROKER (REDIS) ---
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  # --- 8 MICROSERVICES DJANGO ---
  auth-service:
    build: ./services/01_auth_iam
    command: python manage.py runserver 0.0.0.0:8001
    ports: ["8001:8001"]
    depends_on: [db-auth, redis]
    environment: [DATABASE_URL=postgres://postgres:password@db-auth:5432/auth_db]

  sport-service:
    build: ./services/02_sport_perf
    command: python manage.py runserver 0.0.0.0:8002
    ports: ["8002:8002"]
    depends_on: [db-sport, redis]
    environment: [DATABASE_URL=postgres://postgres:password@db-sport:5432/sport_db]

  operations-service:
    build: ./services/03_operations_logistics
    command: python manage.py runserver 0.0.0.0:8003
    ports: ["8003:8003"]
    depends_on: [db-ops, redis]
    environment: [DATABASE_URL=postgres://postgres:password@db-ops:5432/ops_db]

  finance-service:
    build: ./services/04_finance_sponsoring
    command: python manage.py runserver 0.0.0.0:8004
    ports: ["8004:8004"]
    depends_on: [db-finance, redis]
    environment: [DATABASE_URL=postgres://postgres:password@db-finance:5432/finance_db]

  shop-service:
    build: ./services/05_ecommerce_merch
    command: python manage.py runserver 0.0.0.0:8005
    ports: ["8005:8005"]
    depends_on: [db-shop, redis]
    environment: [DATABASE_URL=postgres://postgres:password@db-shop:5432/shop_db]

  messaging-service:
    build: ./services/06_messaging_notifications
    command: daphne -b 0.0.0.0 -p 8006 config.asgi:application
    ports: ["8006:8006"]
    depends_on: [db-chat, redis]
    environment: [DATABASE_URL=postgres://postgres:password@db-chat:5432/chat_db]

  marketing-service:
    build: ./services/07_marketing_cms
    command: python manage.py runserver 0.0.0.0:8007
    ports: ["8007:8007"]
    depends_on: [db-cms, redis]
    environment: [DATABASE_URL=postgres://postgres:password@db-cms:5432/cms_db]

  vault-service:
    build: ./services/08_documents_vault
    command: python manage.py runserver 0.0.0.0:8008
    ports: ["8008:8008"]
    depends_on: [db-vault, redis]
    environment: [DATABASE_URL=postgres://postgres:password@db-vault:5432/vault_db]

  # --- API GATEWAY ---
  api-gateway:
    image: nginx:alpine
    volumes:
      - ./api-gateway/nginx.conf:/etc/nginx/nginx.conf:ro
    ports: ["8000:8000"]
    depends_on:
      - auth-service
      - sport-service
      - operations-service
      - finance-service
      - shop-service
      - messaging-service
      - marketing-service
      - vault-service

volumes:
  auth_data:
  sport_data:
  ops_data:
  finance_data:
  shop_data:
  chat_data:
  cms_data:
  vault_data:
EOF

echo "✨ Félicitations ! L'architecture complète des 8 Microservices est créée et configurée !"