# 🚀 Guide de Déploiement Google Cloud Run - SwipDEAL

Ce guide vous explique comment déployer l'application SwipDEAL sur Google Cloud Run avec une architecture full-stack.

## 📋 Prérequis

### Services Google Cloud à activer
```bash
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable sqladmin.googleapis.com
```

### Variables d'environnement requises
```bash
export PROJECT_ID="secure-electron-471013-r0"
export REGION="europe-west1"
export ARTIFACT_LOCATION="europe-west1"
export REPO_NAME="swideal"
export DB_INSTANCE_NAME="swideal-postgres"
export DATABASE_NAME="swideal_prod"
export DB_USER="swideal_user"
export DB_PASSWORD="$(openssl rand -base64 32)"
```

## 🏗️ Configuration Initiale

### 1. Créer Artifact Registry
```bash
gcloud artifacts repositories create $REPO_NAME \
    --repository-format=docker \
    --location=$ARTIFACT_LOCATION \
    --project=$PROJECT_ID
```

### 2. Authentification Docker
```bash
gcloud auth configure-docker $ARTIFACT_LOCATION-docker.pkg.dev
```

### 3. Configuration Cloud SQL (PostgreSQL)
```bash
# Créer l'instance Cloud SQL
gcloud sql instances create $DB_INSTANCE_NAME \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=$REGION \
    --root-password=$DB_PASSWORD

# Créer la base de données
gcloud sql databases create $DATABASE_NAME \
    --instance=$DB_INSTANCE_NAME

# Créer l'utilisateur
gcloud sql users create $DB_USER \
    --instance=$DB_INSTANCE_NAME \
    --password=$DB_PASSWORD
```

### 4. Build et Push des Images

#### Frontend + API (Image unique)
```bash
# Build de l'image complète
gcloud builds submit --config cloudbuild.yaml \
    --substitutions=_WEB_IMAGE="$ARTIFACT_LOCATION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/swideal-web:latest",_API_IMAGE="$ARTIFACT_LOCATION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/swideal-api:latest"
```

## 🚀 Déploiement

### Déploiement de l'application full-stack
```bash
# Construire l'URL de connexion Cloud SQL
export DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@/$DATABASE_NAME?host=/cloudsql/$PROJECT_ID:$REGION:$DB_INSTANCE_NAME"

gcloud run deploy swideal-app \
    --image $ARTIFACT_LOCATION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/swideal-api:latest \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --set-env-vars "NODE_ENV=production,GEMINI_API_KEY=$GEMINI_API_KEY,DATABASE_URL=$DATABASE_URL" \
    --add-cloudsql-instances $PROJECT_ID:$REGION:$DB_INSTANCE_NAME \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --timeout 300 \
    --service-account swideal-deploy@$PROJECT_ID.iam.gserviceaccount.com
```

## 🔐 Configuration des Secrets

### GitHub Secrets requis
```
GCP_SA_KEY=<service-account-key.json>
GCP_PROJECT_ID=secure-electron-471013-r0
GCP_REGION=europe-west1
GEMINI_API_KEY=<votre-clé-gemini>
DATABASE_URL=postgresql://swideal_user:PASSWORD@/swideal_prod?host=/cloudsql/secure-electron-471013-r0:europe-west1:swideal-postgres
DB_INSTANCE_CONNECTION_NAME=secure-electron-471013-r0:europe-west1:swideal-postgres
```

### Service Account
```bash
gcloud iam service-accounts create swideal-deploy \
    --display-name="SwipDEAL Deployment"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:swideal-deploy@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/run.developer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:swideal-deploy@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:swideal-deploy@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:swideal-deploy@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudsql.instanceUser"

gcloud iam service-accounts keys create key.json \
    --iam-account=swideal-deploy@$PROJECT_ID.iam.gserviceaccount.com
```

## 🔍 Tests et Vérifications

### Health Check
```bash
# Obtenir l'URL du service
SERVICE_URL=$(gcloud run services describe swideal-app --region=$REGION --format="value(status.url)")

# Tester l'API
curl $SERVICE_URL/api/health

# Tester le frontend
curl $SERVICE_URL/
```

### Logs et Monitoring
```bash
# Voir les logs
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=swideal-app" \
    --limit=50 --format="table(timestamp,textPayload)"
```

## 🐛 Résolution des Problèmes

### Erreur 404 sur les routes SPA
- Vérifiez que `serve.json` est présent avec le fallback
- Testez localement avec `npm run preview`

### Problèmes de mémoire
- Augmentez la mémoire : `--memory 2Gi`
- Surveillez les logs pour les erreurs OOM

### Cold Start
- Configurez `--min-instances 1` si nécessaire
- Optimisez le bundle size

## ⚡ Automatisation GitHub Actions

Créez `.github/workflows/deploy.yml` :
```yaml
name: Deploy to Cloud Run
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: google-github-actions/setup-gcloud@v0
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
      - run: gcloud builds submit --config cloudbuild.yaml
      - run: gcloud run deploy swideal-app --image=...
```

---

💡 **Recommandation** : Utilisez plutôt **Replit Autoscale** pour une expérience plus simple !