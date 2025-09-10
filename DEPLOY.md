
# 🚀 Guide de Déploiement Replit - SwipDEAL

## 📋 Prérequis

### 1. Base de données PostgreSQL Replit
1. Ouvrez un nouvel onglet dans Replit et tapez "Database"
2. Dans le panneau "Database", cliquez sur "create a database"
3. Votre `DATABASE_URL` sera automatiquement configurée

### 2. Variables d'environnement (Secrets)
Configurez dans Replit Secrets :
```
DATABASE_URL=<automatiquement configuré par Replit PostgreSQL>
GEMINI_API_KEY=<votre-clé-gemini>
NODE_ENV=production
```

## 🚀 Déploiement

### 1. Autoscale Deployment
```bash
# Utilisez le bouton "Deploy" dans Replit
# Ou configurez via la configuration de déploiement
```

### 2. Configuration du domaine personnalisé
1. Déployez votre app avec Autoscale Deployment
2. Dans les paramètres de déploiement, ajoutez votre domaine `swideal.com`
3. Configurez les DNS selon les instructions Replit

## 🔍 Tests et Monitoring

### Health Checks
```bash
# Tester l'API
curl https://votre-repl.replit.app/api/health
curl https://votre-repl.replit.app/healthz

# Tester le frontend
curl https://votre-repl.replit.app/
```

## 💰 Avantages Replit

- **Simplicity** : Configuration en un clic
- **Coûts réduits** : Facturation usage uniquement  
- **Scaling automatique** : Gestion transparente
- **PostgreSQL intégré** : Base de données managée
- **Domaine personnalisé** : Support natif pour swideal.com

## 🔧 Configuration Production

Votre app est déjà optimisée pour Replit avec :
- Port 5000 configuré pour la production
- PostgreSQL Replit intégré
- Variables d'environnement automatiques
- Build command optimisé
