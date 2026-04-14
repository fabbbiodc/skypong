#!/bin/sh
set -eu

KEY_FILE="/etc/nginx/certs/key.pem"
CRT_FILE="/etc/nginx/certs/cert.pem"

if [ -f "$KEY_FILE" ] && [ -f "$CRT_FILE" ]; then
  echo "TLS cert already exists."
  exit 0
fi

echo "Generating self-signed TLS certificate..."

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$KEY_FILE" \
  -out "$CRT_FILE" \
  -subj "/C=ES/ST=Barcelona/L=Barcelona/O=42/OU=Education/CN=10.19.225.101" \
  -addext "subjectAltName=IP:10.19.225.101,DNS:localhost"

echo "Done."
