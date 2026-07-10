#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

REGISTRY="${DOCKER_REGISTRY:-naveen2202}"
TAG="${IMAGE_TAG:-latest}"
# Production VPS are usually amd64; Mac builds are arm64 unless overridden.
PLATFORM="${DOCKER_PLATFORM:-linux/amd64}"

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
PROXY_IMAGE="${REGISTRY}/fabnet-proxy:${TAG}"

echo "Building and pushing FabNet images (tag: ${TAG})"
echo "  Registry: ${REGISTRY}"
echo "  Platform: ${PLATFORM}"
echo "  Frontend API URL: ${REACT_APP_API_BASE_URL}"
echo "  Frontend kdesigns URL: ${REACT_APP_KDESIGNS_REMOTE_ENTRY_URL}"
echo ""

if ! docker buildx version >/dev/null 2>&1; then
  echo "Error: docker buildx is required for cross-platform builds."
  exit 1
fi

docker buildx inspect fabnet-builder >/dev/null 2>&1 || \
  docker buildx create --name fabnet-builder --use >/dev/null
docker buildx use fabnet-builder >/dev/null

echo "==> Backend: ${BACKEND_IMAGE}"
docker buildx build --platform "${PLATFORM}" \
  -f backend/Dockerfile.prod \
  -t "${BACKEND_IMAGE}" \
  --push ./backend

echo "==> Frontend: ${FRONTEND_IMAGE}"
docker buildx build --platform "${PLATFORM}" \
  -f frontend/Dockerfile.prod \
  --build-arg "REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}" \
  --build-arg "REACT_APP_KDESIGNS_REMOTE_ENTRY_URL=${REACT_APP_KDESIGNS_REMOTE_ENTRY_URL}" \
  -t "${FRONTEND_IMAGE}" \
  --push ./frontend

echo "==> kdesigns: ${KDESIGNS_IMAGE}"
docker buildx build --platform "${PLATFORM}" \
  -f kdesigns/Dockerfile.compose.prod \
  -t "${KDESIGNS_IMAGE}" \
  --push ./kdesigns

echo "==> proxy: ${PROXY_IMAGE}"
docker buildx build --platform "${PLATFORM}" \
  -f nginx/Dockerfile \
  -t "${PROXY_IMAGE}" \
  --push ./nginx

echo ""
echo "Done. Images pushed:"
echo "  ${BACKEND_IMAGE}"
echo "  ${FRONTEND_IMAGE}"
echo "  ${KDESIGNS_IMAGE}"
echo "  ${PROXY_IMAGE}"
