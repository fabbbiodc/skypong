#!/bin/sh
set -e

echo "[auth] syncing JWT keys to volume ..."

# If there is no key
if [ -z "$(ls -A /app/keys 2>/dev/null)" ]; then
    echo "[auth] keys volume empty"
    
    if ls /app/jwt-*.pem >/dev/null 2>&1; then
        echo "[auth] copying keys from"
		cp /app/jwt-*.pem /app/keys/
	else 
		echo "[auth] ERROR: no jwt-*.pem found in /app"
	fi
else
	echo "[auth] keys already present in volume"
fi

echo "[auth] setting ownership of /app/keys/ to app:app"
chown -R app:app /app/keys

exec "$@"
