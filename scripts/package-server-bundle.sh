#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

BUNDLE_DIR="fabnet-server-bundle"
ARCHIVE_NAME="fabnet-server-bundle.tar.gz"

echo "==> Creating production server deployment package..."

rm -rf "${BUNDLE_DIR}" "${ARCHIVE_NAME}"
mkdir -p "${BUNDLE_DIR}/backend" "${BUNDLE_DIR}/scripts"

# 1. Compose file
cp docker-compose.prod.pull.yml "${BUNDLE_DIR}/"

# 2. Environment templates
cp .env.example "${BUNDLE_DIR}/.env.example"
cp backend/.env.production.example "${BUNDLE_DIR}/backend/.env.production.example"

# 3. Static public website
cp -r public "${BUNDLE_DIR}/"

# 4. Server operational scripts
cp scripts/server-setup.sh "${BUNDLE_DIR}/scripts/"
cp scripts/server-ssl-init.sh "${BUNDLE_DIR}/scripts/"
cp scripts/server-ssl-renew.sh "${BUNDLE_DIR}/scripts/"
cp scripts/server-pull-up.sh "${BUNDLE_DIR}/scripts/"
cp scripts/reset-admin-password.sh "${BUNDLE_DIR}/scripts/"
cp scripts/fix-mysql-passwords.sh "${BUNDLE_DIR}/scripts/"

chmod +x "${BUNDLE_DIR}"/scripts/*.sh

# 5. Quick start guide for the server
cat > "${BUNDLE_DIR}/SERVER_README.txt" << 'EOF'
=== FABNET PRODUCTION SERVER QUICK START ===

1. Create production environment files:
   cp .env.example .env
   cp backend/.env.production.example backend/.env.production

2. Edit secrets in .env and backend/.env.production:
   nano .env
   nano backend/.env.production

   Essential variables to check in .env:
   - MYSQL_ROOT_PASSWORD & MYSQL_PASSWORD
   - MAIN_DOMAIN=fabnetsystems.com
   - PANEL_DOMAIN=panel.fabnetsystems.com
   - API_DOMAIN=api.fabnetsystems.com
   - CDN_DOMAIN=cdn.fabnetsystems.com
   - LETSENCRYPT_EMAIL=you@fabnetsystems.com

3. Verify DNS:
   Ensure A records (@, www, panel, api, cdn) point to this server's public IP.

4. Run first-time setup:
   ./scripts/server-setup.sh

5. For future updates after pushing new images:
   ./scripts/server-pull-up.sh
EOF

# 6. Create tar archive
tar -czf "${ARCHIVE_NAME}" -C "${BUNDLE_DIR}" .
rm -rf "${BUNDLE_DIR}"

echo "==> Success! Package created: ${ARCHIVE_NAME} ($(du -h "${ARCHIVE_NAME}" | cut -f1))"
echo ""
echo "Deployment Steps:"
echo "1. Upload bundle to your server:"
echo "   scp ${ARCHIVE_NAME} root@<SERVER_IP>:/opt/"
echo ""
echo "2. On the server, extract to /opt/fabnet:"
echo "   ssh root@<SERVER_IP>"
echo "   mkdir -p /opt/fabnet"
echo "   tar -xzf /opt/${ARCHIVE_NAME} -C /opt/fabnet"
echo "   cd /opt/fabnet"
echo ""
echo "3. Configure env & start:"
echo "   cp .env.example .env"
echo "   cp backend/.env.production.example backend/.env.production"
echo "   nano .env"
echo "   nano backend/.env.production"
echo "   ./scripts/server-setup.sh"
echo ""
