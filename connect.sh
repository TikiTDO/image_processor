#!/usr/bin/env bash
#
# connect.sh - establish SSH tunnel to remote server for backend and frontend ports
#
set -euo pipefail

# Remote host (user@hostname), defaulting to localhost if not set
REMOTE_HOST="${REMOTE_HOST:-localhost}"

echo "Connecting to remote host: $REMOTE_HOST"
echo "Forwarding ports: localhost:5700 -> remote:5700, localhost:5800 -> remote:5800"

# SSH command with local port forwardings (no remote command execution)
ssh -N \
  -L 5700:localhost:5700 \
  -L 5800:localhost:5800 \
  "$REMOTE_HOST"