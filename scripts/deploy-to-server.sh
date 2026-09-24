#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <user@server-ip> [remote_dir]"
  echo "Example: $0 root@139.59.80.20"
  echo "Example: $0 ubuntu@my-server-ip /opt/fabnet"
  exit 1
fi

TARGET="$1"
REMOTE_DIR="${2:-/opt/fabnet}"
BUNDLE_FILE="fabnet-server-bundle.tar.gz"

echo "==> Packaging server bundle..."
./scripts/package-server-bundle.sh

echo "==> Ensuring remote directory exists: ${REMOTE_DIR} on ${TARGET}..."
ssh "${TARGET}" "mkdir -p ${REMOTE_DIR}"

echo "==> Uploading bundle to ${TARGET}:${REMOTE_DIR}/..."
scp "${BUNDLE_FILE}" "${TARGET}:${REMOTE_DIR}/"

echo "==> Extracting bundle on ${TARGET}..."
ssh "${TARGET}" "cd ${REMOTE_DIR} && tar -xzf ${BUNDLE_FILE} && rm -f ${BUNDLE_FILE} && chmod +x scripts/*.sh"

echo ""
echo "==> Deployment files successfully transferred to ${TARGET}:${REMOTE_DIR}!"
echo ""
echo "Next Steps on ${TARGET}:"
echo "  1. ssh ${TARGET}"
echo "  2. cd ${REMOTE_DIR}"
echo "  3. [If first time] cp .env.example .env && cp backend/.env.production.example backend/.env.production"
echo "  4. [If first time] nano .env && nano backend/.env.production"
echo "  5. ./scripts/server-setup.sh (or ./scripts/server-pull-up.sh for updates)"
echo ""
