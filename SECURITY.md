# Security & Environment Configuration Guide

## 🔒 Critical Security Rules

### 1. NEVER Commit `.env` Files
- ✅ Commit: `.env.example`, `.gitignore`
- ❌ DO NOT COMMIT: `.env`, `.env.prod`, `.env.staging`, API keys, passwords

### 2. Environment File Hierarchy
```
Priority Order (first match wins):
1. .env.local (developer-specific, ignored by git)
2. .env.{ENVIRONMENT} (prod/staging/dev, ignored by git)
3. .env.example (reference only)
```

### 3. Required Environment Variables

#### Backend (Django Services)
- `SECRET_KEY` — Django secret key (generate a new one per environment)
- `DEBUG` — Set to `False` in production
- `DB_PASSWORD` — Database password (NEVER hardcoded)
- `CORS_ALLOWED_ORIGINS` — Whitelist frontend URLs
- `EMAIL_HOST_PASSWORD` — Email service password

#### Frontend (Vite/React)
- `VITE_API_BASE_URL` — Backend API endpoint
- `VITE_AUTH_API_URL` — Auth service endpoint
- All `VITE_*` variables are exposed to the browser (never put secrets here!)

## 🚀 Setup Instructions

### For Development
```bash
# Backend Service
cd Backend/src/services/{auth_iam|finance_sponsoring|sport_perf}
cp .env.example .env
# Edit .env with your local values
```

```bash
# Frontend
cd Frontend
cp .env.example .env
# Edit .env with your local dev server URLs
```

### For Production
1. Use a secrets manager (AWS Secrets Manager, HashiCorp Vault, etc.)
2. Never store secrets in code repositories
3. Rotate secrets regularly
4. Use different secrets per environment

## 🔐 Generating Secure Secrets

### Django SECRET_KEY
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### JWT Secret
```bash
openssl rand -hex 32
```

### API Keys
Use environment-specific keys from third-party services (Stripe, SendGrid, etc.)

## ✅ Pre-Commit Checklist
- [ ] No `.env` files in git history
- [ ] `.env.example` contains placeholders only
- [ ] `.gitignore` includes all sensitive file patterns
- [ ] Secrets in CI/CD are configured via GitHub Secrets/Actions
- [ ] Database passwords changed from defaults

## 📋 Git Cleanup (if needed)
```bash
# Remove accidentally committed .env files
git rm --cached .env
git rm --cached Backend/src/services/*/.env
git commit -m "Remove sensitive .env files"

# Or use BFG Repo-Cleaner for history cleanup
bfg --delete-files .env
```

## 🔍 Security Scanning
```bash
# Detect secrets in code
pip install detect-secrets
detect-secrets scan

# Check for exposed keys
pip install truffleHog
truffleHog filesystem . --json
```

## 📚 References
- [OWASP: Secrets Management](https://owasp.org/www-community/attacks/Sensitive_Data_Exposure)
- [12 Factor App: Config](https://12factor.net/config)
- [Django Security](https://docs.djangoproject.com/en/stable/topics/security/)
