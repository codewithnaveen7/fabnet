#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

REGISTRY="${DOCKER_REGISTRY:-naveen2202}"
TAG="${IMAGE_TAG:-latest}"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

REACT_APP_API_BASE_URL="${REACT_APP_API_BASE_URL:-https://api.fabnetsystems.com/api}"
REACT_APP_KDESIGNS_REMOTE_ENTRY_URL="${REACT_APP_KDESIGNS_REMOTE_ENTRY_URL:-https://cdn.fabnetsystems.com/kdesigns/remoteEntry.js}"

BACKEND_IMAGE="${REGISTRY}/fabnet-backend:${TAG}"
FRONTEND_IMAGE="${REGISTRY}/fabnet-frontend:${TAG}"
KDESIGNS_IMAGE="${REGISTRY}/fabnet-kdesigns:${TAG}"

echo "Building and pushing FabNet images (tag: ${TAG})"
echo "  Registry: ${REGISTRY}"
echo "  Frontend API URL: ${REACT_APP_API_BASE_URL}"
echo "  Frontend kdesigns URL: ${REACT_APP_KDESIGNS_REMOTE_ENTRY_URL}"
echo ""

echo "==> Backend: ${BACKEND_IMAGE}"
docker build -f backend/Dockerfile.prod -t "${BACKEND_IMAGE}" ./backend

echo "==> Frontend: ${FRONTEND_IMAGE}"
docker build -f frontend/Dockerfile.prod \
  --build-arg "REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}" \
  --build-arg "REACT_APP_KDESIGNS_REMOTE_ENTRY_URL=${REACT_APP_KDESIGNS_REMOTE_ENTRY_URL}" \
  -t "${FRONTEND_IMAGE}" ./frontend

echo "==> kdesigns: ${KDESIGNS_IMAGE}"
docker build -f kdesigns/Dockerfile.compose.prod -t "${KDESIGNS_IMAGE}" ./kdesigns

echo ""
echo "==> Pushing images..."
docker push "${BACKEND_IMAGE}"
docker push "${FRONTEND_IMAGE}"
docker push "${KDESIGNS_IMAGE}"

echo ""
echo "Done. Images pushed:"
echo "  ${BACKEND_IMAGE}"
echo "  ${FRONTEND_IMAGE}"
echo "  ${KDESIGNS_IMAGE}"
