#!/usr/bin/env bash
set -euo pipefail
bash scripts/prepreview.sh
# Relance le serveur Express avec Vite intégré
NODE_ENV=development tsx server/index.ts