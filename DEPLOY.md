# 🚀 Guide de Déploiement Google Cloud Run - Swideal

Ce guide vous explique comment déployer l'application Swideal sur Google Cloud Run avec PostgreSQL (Cloud SQL) et Google Cloud Storage.

## 📋 Prérequis

### Services Google Cloud à activer
- Cloud Run API
- Cloud SQL Admin API
- Artifact Registry API
- Cloud Storage API
- Cloud Build API

### Outils requis
- [Google Cloud CLI](https://cloud.google.com/sdk/docs/install)
- Docker
- Node.js 20+

## 🔧 Configuration Initiale

### 1. Créer les ressources Google Cloud

```bash
# Variables du projet
export PROJECT_ID="votre-project-id"
export REGION="europe-west1"
export ARTIFACT_LOCATION="europe-west1"

# Activer les APIs
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable storage.googleapis.com

# Créer Artifact Registry
gcloud artifacts repositories create swideal \
    --repository-format=docker \
    --location=$ARTIFACT_LOCATION

# Créer instance Cloud SQL (PostgreSQL)
gcloud sql instances create swideal-db \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=$REGION

# Créer la base de données
gcloud sql databases create swideal --instance=swideal-db

# Créer bucket Cloud Storage
gsutil mb gs://swideal-uploads
```

### 2. Créer un Service Account

```bash
# Créer le service account
gcloud iam service-accounts create swideal-deploy \
    --display-name="Swideal Deployment"

# Attribuer les rôles nécessaires
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:swideal-deploy@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/run.developer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:swideal-deploy@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:swideal-deploy@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"

# Créer et télécharger la clé
gcloud iam service-accounts keys create key.json \
    --iam-account=swideal-deploy@$PROJECT_ID.iam.gserviceaccount.com
```

## 🔐 Configuration GitHub Secrets

Dans votre repository GitHub, ajoutez ces secrets (Settings > Secrets and variables > Actions) :

```
GCP_SA_KEY=<contenu du fichier key.json>
GCP_PROJECT_ID=votre-project-id
GCP_REGION=europe-west1
GCP_ARTIFACT_LOCATION=europe-west1
GCP_REPO=swideal
CLOUD_RUN_SERVICE_FRONT=swideal-web
CLOUD_RUN_SERVICE_API=swideal-api
DATABASE_URL=postgresql://user:password@host:5432/swideal?sslmode=require
GCS_BUCKET=swideal-uploads
OPENAI_API_KEY=sk-... (optionnel)
```

## 🏗️ Tests Locaux

### Frontend (SPA)
```bash
# Installation et build
npm ci
npm run build
npm run preview

# Test Docker
docker build -t swideal-web .
docker run -p 8080:8080 swideal-web
```

### API
```bash
# Test Docker API
docker build -f server/Dockerfile -t swideal-api .
docker run -p 8080:8080 \
  -e DATABASE_URL="postgresql://..." \
  -e GCS_BUCKET="swideal-uploads" \
  swideal-api
```

## 🚀 Déploiement

### Automatique via GitHub Actions
Le déploiement se fait automatiquement lors d'un push sur la branche `main` :

- **Frontend** : Déclenchement sur changements dans `client/`, `shared/`, `vite.config.ts`
- **API** : Déclenchement sur changements dans `server/`, `shared/`, `drizzle.config.ts`

### Manuel
```bash
# Frontend
gcloud run deploy swideal-web \
    --image europe-west1-docker.pkg.dev/$PROJECT_ID/swideal/swideal-web:latest \
    --platform managed \
    --region europe-west1 \
    --allow-unauthenticated \
    --port 8080

# API
gcloud run deploy swideal-api \
    --image europe-west1-docker.pkg.dev/$PROJECT_ID/swideal/swideal-api:latest \
    --platform managed \
    --region europe-west1 \
    --allow-unauthenticated \
    --port 8080 \
    --set-env-vars DATABASE_URL="postgresql://..."
```

## 🔍 Vérifications Post-Déploiement

### Frontend
```bash
# Vérifier que le SPA fonctionne
curl -I https://swideal-web-xxxxx.run.app/
curl -I https://swideal-web-xxxxx.run.app/missions  # Doit retourner index.html

# Vérifier les routes dynamiques
curl https://swideal-web-xxxxx.run.app/feed
curl https://swideal-web-xxxxx.run.app/create-mission
```

### API
```bash
# Health check
curl https://swideal-api-xxxxx.run.app/healthz

# Test API endpoints
curl https://swideal-api-xxxxx.run.app/api/health
curl https://swideal-api-xxxxx.run.app/api/missions
```

## 🐛 Résolution des Problèmes

### Erreur 404 sur les routes SPA
Si les routes applicatives retournent 404 :
1. Vérifiez que `serve.json` est présent
2. Vérifiez que le fallback `**` → `/index.html` fonctionne
3. Testez localement avec `npm run preview`

### Problèmes de base de données
```bash
# Vérifier la connexion Cloud SQL
gcloud sql connect swideal-db --user=postgres

# Exécuter les migrations manuellement
npm run migrate
```

### Problèmes de build Docker
```bash
# Debug du build frontend
docker build --no-cache -t debug-web .
docker run --rm debug-web ls -la /app/dist

# Debug du build API
docker build --no-cache -f server/Dockerfile -t debug-api .
docker run --rm debug-api ls -la /app
```

## 📊 Monitoring

### Logs Cloud Run
```bash
# Logs frontend
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=swideal-web" \
    --limit=50 --format="table(timestamp,textPayload)"

# Logs API
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=swideal-api" \
    --limit=50 --format="table(timestamp,textPayload)"
```

### Métriques
- **Health checks** : `/healthz` pour l'API
- **Uptime monitoring** : Configurez des alertes Cloud Monitoring
- **Performance** : Surveillez les métriques Cloud Run (latence, erreurs, CPU, mémoire)

## 🔒 Sécurité

### Variables d'environnement sensibles
- Toujours utiliser Google Secret Manager pour les secrets en production
- Ne jamais commiter de clés API ou mots de passe
- Utiliser des rôles IAM minimaux

### CORS et authentification
- L'API expose des endpoints publics (`--allow-unauthenticated`)
- Ajustez selon vos besoins de sécurité
- Configurez CORS si frontend et API sur domaines différents

## 📚 Documentation Supplémentaire

- [Guide Cloud Run](https://cloud.google.com/run/docs)
- [Cloud SQL avec Cloud Run](https://cloud.google.com/sql/docs/postgres/connect-run)
- [Artifact Registry](https://cloud.google.com/artifact-registry/docs)
- [GitHub Actions avec GCP](https://github.com/google-github-actions)

---

🎉 **Votre application Swideal est maintenant déployée sur Google Cloud Run !**