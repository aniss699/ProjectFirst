#!/usr/bin/env bash
set -euo pipefail
bash scripts/prepreview.sh

# Détection si on est en mode preview (même environnement que deploy)
if [ "${PREVIEW_MODE:-}" = "true" ]; then
  echo "🚀 Mode Preview: utilisation de l'environnement de production"
  NODE_ENV=production node dist/index.js
else
  echo "🛠️ Mode Development: environnement local"
  NODE_ENV=development tsx server/index.ts
fi