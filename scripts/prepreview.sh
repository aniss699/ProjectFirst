#!/usr/bin/env bash
set -euo pipefail

echo "🔎 Preflight preview…"

# 1) Node >= 18
if command -v node >/dev/null 2>&1; then
  NODE_MAJ=$(node -p "process.versions.node.split('.')[0]")
  if [ "$NODE_MAJ" -lt 18 ]; then
    echo "❌ Node < 18 détecté. Merci d'installer Node 18+."
    exit 1
  fi
else
  echo "❌ Node non trouvé."
  exit 1
fi

# 2) Installer deps si node_modules absent/incomplet
if [ ! -d node_modules ]; then
  echo "📦 Installation des dépendances…"
  npm install
fi

# 3) Nettoyage cache conditionnel si lockfile changé
mkdir -p .cache
HASH_NOW=""
if [ -f package-lock.json ]; then HASH_NOW=$(sha256sum package-lock.json | awk '{print $1}'); fi
if [ -f yarn.lock ]; then HASH_NOW=$(sha256sum yarn.lock | awk '{print $1}'); fi
if [ -f pnpm-lock.yaml ]; then HASH_NOW=$(sha256sum pnpm-lock.yaml | awk '{print $1}'); fi

if [ -n "$HASH_NOW" ]; then
  if [ ! -f .cache/lock.hash ] || [ "$(cat .cache/lock.hash)" != "$HASH_NOW" ]; then
    echo "🧹 Lockfile modifié → purge caches Vite."
    rm -rf node_modules/.vite .vite dist
    echo "$HASH_NOW" > .cache/lock.hash
  fi
fi

# 4) Vérifier vite.config.ts: allowedHosts (déjà configuré dans ce projet)
if [ -f vite.config.ts ]; then
  if grep -q "allowedHosts" vite.config.ts; then
    echo "✅ vite.config.ts déjà configuré avec allowedHosts"
  else
    echo "⚠️ vite.config.ts existe mais allowedHosts manquant"
  fi
fi

# 5) Vérifs de base (non bloquantes pour compatibilité)
if npx --yes tsc --version >/dev/null 2>&1; then
  echo "🧪 TypeScript check…"
  npx --yes tsc --noEmit && echo "✅ TypeScript OK" || echo "⚠️ Avertissements TypeScript (non bloquant)"
fi

# 6) Détection d'imports cassés via esbuild (rapide) si présent
if npx --yes esbuild --version >/dev/null 2>&1; then
  if [ -f client/src/main.tsx ] || [ -f client/src/main.ts ]; then ENTRY=$( [ -f client/src/main.tsx ] && echo client/src/main.tsx || echo client/src/main.ts ); else ENTRY=client/src/index.tsx; fi
  if [ -f "$ENTRY" ]; then
    echo "🔗 Check imports (esbuild)…"
    npx --yes esbuild "$ENTRY" --bundle --platform=browser --outfile=/dev/null || { echo "❌ Import cassé"; exit 1; }
  fi
fi

# 6.5) Build pour mode preview si nécessaire
if [ "${PREVIEW_MODE:-}" = "true" ]; then
  echo "🏗️ Mode Preview: build de production…"
  if [ ! -d dist ] || [ package.json -nt dist ]; then
    npm run build || { echo "❌ Build échoué"; exit 1; }
  fi
  echo "✅ Build terminé pour mode Preview"
fi

# 7) Purge processus zombies
pkill -f "tsx.*server/index.ts" >/dev/null 2>&1 || true
pkill -f "vite" >/dev/null 2>&1 || true

echo "✅ Preflight OK"