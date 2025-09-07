
# 🚀 Guide de Déploiement Google Cloud Run - SwipDEAL

## 📋 Prérequis

### 1. Services Google Cloud à activer
```bash
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
```

### 2. Variables d'environnement
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

## 🏗️ Configuration Infrastructure

### 1. Créer Artifact Registry
```bash
gcloud artifacts repositories create $REPO_NAME \
    --repository-format=docker \
    --location=$ARTIFACT_LOCATION \
    --project=$PROJECT_ID \
    --description="SwipDEAL application images"
```

### 2. Configuration Cloud SQL
```bash
# Créer l'instance Cloud SQL
gcloud sql instances create $DB_INSTANCE_NAME \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=$REGION \
    --storage-type=SSD \
    --storage-size=10GB \
    --backup-start-time=03:00 \
    --maintenance-window-day=SUN \
    --maintenance-window-hour=04 \
    --deletion-protection

# Créer la base de données
gcloud sql databases create $DATABASE_NAME \
    --instance=$DB_INSTANCE_NAME

# Créer l'utilisateur
gcloud sql users create $DB_USER \
    --instance=$DB_INSTANCE_NAME \
    --password=$DB_PASSWORD
```

### 3. Service Account Configuration
```bash
# Créer le service account
gcloud iam service-accounts create swideal-deploy \
    --display-name="SwipDEAL Deployment Service Account" \
    --description="Service account for SwipDEAL Cloud Run deployment"

# Assigner les rôles nécessaires
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

# Générer la clé
gcloud iam service-accounts keys create key.json \
    --iam-account=swideal-deploy@$PROJECT_ID.iam.gserviceaccount.com
```

## 🚀 Déploiement

### 1. Build et Push des Images
```bash
# Authentification Docker
gcloud auth configure-docker $ARTIFACT_LOCATION-docker.pkg.dev

# Build avec Cloud Build
gcloud builds submit --config cloudbuild.yaml \
    --substitutions=_WEB_IMAGE="$ARTIFACT_LOCATION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/swideal-web:latest",_API_IMAGE="$ARTIFACT_LOCATION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/swideal-api:latest"
```

### 2. Déploiement de l'Application
```bash
# Construire l'URL de connexion Cloud SQL
export DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@/$DATABASE_NAME?host=/cloudsql/$PROJECT_ID:$REGION:$DB_INSTANCE_NAME"

# Déployer sur Cloud Run
gcloud run deploy swideal-app \
    --image $ARTIFACT_LOCATION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/swideal-api:latest \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --set-env-vars "NODE_ENV=production,GEMINI_API_KEY=$GEMINI_API_KEY,DATABASE_URL=$DATABASE_URL" \
    --add-cloudsql-instances $PROJECT_ID:$REGION:$DB_INSTANCE_NAME \
    --memory 2Gi \
    --cpu 2 \
    --min-instances 0 \
    --max-instances 100 \
    --timeout 900 \
    --concurrency 1000 \
    --service-account swideal-deploy@$PROJECT_ID.iam.gserviceaccount.com \
    --execution-environment gen2
```

## 🔍 Tests et Monitoring

### Health Checks
```bash
# Obtenir l'URL du service
SERVICE_URL=$(gcloud run services describe swideal-app --region=$REGION --format="value(status.url)")

# Tester l'API
curl $SERVICE_URL/api/health
curl $SERVICE_URL/healthz

# Tester le frontend
curl $SERVICE_URL/
```

### Logs et Debugging
```bash
# Voir les logs en temps réel
gcloud logs tail "resource.type=cloud_run_revision AND resource.labels.service_name=swideal-app" --location=$REGION

# Logs spécifiques aux erreurs
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=swideal-app AND severity>=ERROR" --limit=50
```

## 🔐 GitHub Secrets

Configurez ces secrets dans votre repository GitHub :

```
GCP_SA_KEY=<contenu de key.json en base64>
GCP_PROJECT_ID=secure-electron-471013-r0
GCP_REGION=europe-west1
GEMINI_API_KEY=<votre-clé-gemini>
DATABASE_URL=postgresql://swideal_user:PASSWORD@/swideal_prod?host=/cloudsql/secure-electron-471013-r0:europe-west1:swideal-postgres
DB_INSTANCE_CONNECTION_NAME=secure-electron-471013-r0:europe-west1:swideal-postgres
```

## ⚡ Optimisations Production

### 1. Performance
- **Mémoire** : 2Gi pour gérer les appels IA
- **CPU** : 2 vCPU pour les calculs complexes
- **Concurrency** : 1000 requêtes par instance
- **Cold Start** : Optimisé avec gen2

### 2. Scaling
- **Min instances** : 0 (coût optimal)
- **Max instances** : 100 (haute disponibilité)
- **Auto-scaling** : Basé sur CPU et mémoire

### 3. Sécurité
- **Service account** dédié avec permissions minimales
- **Cloud SQL** avec connexions sécurisées
- **Variables d'environnement** chiffrées

## 🐛 Résolution des Problèmes

### Erreurs de Migration
```bash
# Se connecter à Cloud SQL pour debug
gcloud sql connect $DB_INSTANCE_NAME --user=$DB_USER --database=$DATABASE_NAME
```

### Problèmes de Mémoire
```bash
# Augmenter la mémoire si nécessaire
gcloud run services update swideal-app --memory 4Gi --region=$REGION
```

### Cold Start Lent
```bash
# Garder une instance active
gcloud run services update swideal-app --min-instances 1 --region=$REGION
```

✅ **Configuration prête pour la production !**
