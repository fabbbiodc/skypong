#!/usr/bin/env bash
set -euo pipefail

GRAFANA_ADMIN_USER_VALUE=${GRAFANA_ADMIN_USER:-grafana_admin}
GRAFANA_ADMIN_PASSWORD_VALUE=${GRAFANA_ADMIN_PASSWORD:-change_me_please}

ENV_FILE=".env"
EXAMPLE_FILE=".env.example"

# 1. CREATE .env FROM .env.example IF NOT EXISTS
if [ ! -f "$ENV_FILE" ]; then
  echo "📄 Creating .env from .env.example"
  cp "$EXAMPLE_FILE" "$ENV_FILE"
fi

# 2. ADD VARIABLES WHICH IXIST IN .env.example AND DO NOT EXIST IN .env
while IFS= read -r line; do
  [[ -z "$line" || "$line" =~ ^# ]] && continue

  key=$(echo "$line" | cut -d '=' -f1)

  if ! grep -q "^${key}=" "$ENV_FILE"; then
    echo "$line" >> "$ENV_FILE"
    echo "➕ Added missing variable $key"
  fi
done < "$EXAMPLE_FILE"

# 3. RENOVATE UID/GID
system=$(uname -s)

if [[ $system == "Linux" ]]; then
  sed -i "s/^UID=.*/UID=$(id -u)/" "$ENV_FILE" 2>/dev/null || echo "UID=$(id -u)" >> "$ENV_FILE"
  sed -i "s/^GID=.*/GID=$(id -g)/" "$ENV_FILE" 2>/dev/null || echo "GID=$(id -g)" >> "$ENV_FILE"
fi

if [[ $system == "Darwin" ]]; then
  sed -i '' "s/^UID=.*/UID=$(id -u)/" "$ENV_FILE" 2>/dev/null || echo "UID=$(id -u)" >> "$ENV_FILE"
  sed -i '' "s/^GID=.*/GID=$(id -g)/" "$ENV_FILE" 2>/dev/null || echo "GID=$(id -g)" >> "$ENV_FILE"
fi

DOCKCOMPS="docker-compose.yml"

# CAMBIAR BASE DEPENDIENDO DEL HOST (42 O TU CASA)
#BASE="/sgoinfre/students/${USER}/transcendence-dev/volumes/"
BASE=$PWD/volumes/
echo $BASE
AUTH="sqlite_auth"
FRONT="front-dev"
STATISTICS="statistics"
PROFILE="profile"
GAME_SERVICE="game"
STATIC="${PWD}/static"
UPLOADS="${PWD}/uploads"
AVATARS="${UPLOADS}/avatars"

# Crear directorios host para todos los volúmenes y aplicar permisos
mkdir -p \
  "${BASE}${AUTH}" \
  "${BASE}${FRONT}" \
  "${BASE}${STATISTICS}" \
  "${BASE}${PROFILE}" \
  "${STATIC}" \
  "${AVATARS}" 2>/dev/null || true

chmod 777 \
  "${BASE}${AUTH}" \
  "${BASE}${FRONT}" \
  "${BASE}${STATISTICS}" \
  "${BASE}${PROFILE}" \
  "${STATIC}" \
  "${UPLOADS}" 2>/dev/null || true


# Intentar chown (puede fallar en 42/rootless o ciertos FS) sin romper el script
chown -R "$USER:$USER" \
  "${BASE}${AUTH}" \
  "${BASE}${FRONT}" \
  "${BASE}${STATISTICS}" \
  "${BASE}${PROFILE}" \
  "${STATIC}" \
  "${UPLOADS}" 2>/dev/null || true

# Asegurar permisos mínimos para tu usuario
chmod -R u+rwX \
  "${BASE}${AUTH}" \
  "${BASE}${FRONT}" \
  "${BASE}${STATISTICS}" \
  "${BASE}${PROFILE}" \
  "${STATIC}" \
  "${UPLOADS}" 2>/dev/null || true

echo "✅ Directorios OK:"
ls -ld "${BASE}${AUTH}" "${BASE}${FRONT}" "${BASE}${STATISTICS}" "${BASE}${PROFILE}" "${UPLOADS}" "${STATIC}" "${AVATARS}"

# 3) SUSTITUIR PLACEHOLDERS EN docker-compose.yml
echo "🧩 Sustituyendo placeholders de paths..."

# LINUX
system=$(uname -s)
if [[ $system == "Linux" ]]; then
    sed -i "s|PLACEHOLDER_SQLITE_AUTH|${BASE}${AUTH}|g" "$DOCKCOMPS"
    sed -i "s|PLACEHOLDER_STATISTICS|${BASE}${STATISTICS}|g" "$DOCKCOMPS"
    sed -i "s|PLACEHOLDER_GAME_SERVICE|${BASE}${GAME_SERVICE}|g" "$DOCKCOMPS"
    sed -i "s|PLACEHOLDER_PROFILE|${BASE}${PROFILE}|g" "$DOCKCOMPS"
    sed -i "s|PLACEHOLDER_FRONT|${BASE}${FRONT}|g" "$DOCKCOMPS"
fi

# MacOS
if [[ $system == "Darwin" ]]; then
    sed -i '' "s|PLACEHOLDER_SQLITE_AUTH|${BASE}${AUTH}|g" "$DOCKCOMPS"
    sed -i '' "s|PLACEHOLDER_STATISTICS|${BASE}${STATISTICS}|g" "$DOCKCOMPS"
    sed -i '' "s|PLACEHOLDER_GAME_SERVICE|${BASE}${GAME_SERVICE}|g" "$DOCKCOMPS"
    sed -i '' "s|PLACEHOLDER_PROFILE|${BASE}${PROFILE}|g" "$DOCKCOMPS"
    sed -i '' "s|PLACEHOLDER_FRONT|${BASE}${FRONT}|g" "$DOCKCOMPS"
fi

echo "✅ Placeholders sustituidos en '$DOCKCOMPS'."
echo "👉 Ya puedes hacer: make up"
