# path: nc
#!/usr/bin/env bash
# Thin wrapper – run CLI inside the container so you don't need Node locally.
# Usage examples:
#   ./nc dns:list example.com
#   ./nc dns:add example.com @ A 203.0.113.42 --ttl 5m
#   ./nc dns:delete example.com 12345 67890

set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

docker compose -f "$DIR/docker-compose.yml" run --rm \
  namecheap-manager "$@"
