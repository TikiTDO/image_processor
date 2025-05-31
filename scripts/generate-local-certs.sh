#!/usr/bin/env bash
set -euo pipefail

# Generate a self-signed certificate for localhost with SAN
CERT_DIR="backend/certs"
mkdir -p "$CERT_DIR"

# Create a minimal OpenSSL config with SAN for localhost and 127.0.0.1
cat > "$CERT_DIR/localhost.cnf" <<CERTCFG
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
CN = localhost

[v3_req]
subjectAltName = DNS:localhost,IP:127.0.0.1
CERTCFG

openssl req -x509 -nodes -newkey rsa:2048 \
  -keyout "$CERT_DIR/key.pem" \
  -out "$CERT_DIR/cert.pem" \
  -days 365 \
  -config "$CERT_DIR/localhost.cnf"

# Clean up temporary config
rm "$CERT_DIR/localhost.cnf"

echo "Generated self-signed TLS certificate and key in $CERT_DIR"