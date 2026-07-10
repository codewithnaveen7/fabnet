# FabNet — Server (Production) Setup Guide

Yeh document batata hai ki **production server** par kya-kya change karna hai aur kaunsi file kahan hai.

---

## Dev vs Prod — Quick Summary

| | Local (Dev) | Server (Prod — recommended) | Server (Prod — git build) |
|---|-------------|----------------------------|---------------------------|
| **Command** | `docker compose up --build` | `./scripts/server-setup.sh` | `./scripts/server-setup.sh` (with `COMPOSE_FILE=docker-compose.prod.yml`) |
| **Compose file** | `docker-compose.yml` | `docker-compose.prod.pull.yml` | `docker-compose.prod.yml` |
| **Code on server** | Full repo | **Not required** | Full repo (git clone) |
| **Root env** | `.env` | `.env` (strong secrets) | `.env` (strong secrets) |
| **Backend env** | `backend/.env.development` | `backend/.env.production` | `backend/.env.production` |
| **App images** | Built locally | **Pulled from Docker Hub** | Built on server |
| **DB seed** | Yes (auto) | No | No |
| **MySQL port** | 3306 exposed | Internal only | Internal only |

---

## Production deploy — Docker Hub (recommended)

Server par **git clone ya build ki zaroorat nahi**. Images local machine se Docker Hub par push hoti hain; server sirf pull karta hai.

### Architecture

```
Local laptop  →  docker build + push  →  Docker Hub (naveen2202)
Production server  →  docker pull + compose up  →  running containers
```

**Docker Hub images:**

| Service | Image |
|---------|-------|
| backend | `naveen2202/fabnet-backend:latest` |
| frontend | `naveen2202/fabnet-frontend:latest` |
| kdesigns | `naveen2202/fabnet-kdesigns:latest` |
| proxy (nginx + SSL) | `naveen2202/fabnet-proxy:latest` |

MySQL, phpMyAdmin, and Certbot use public images (`mysql:8`, `phpmyadmin:5`, `certbot/certbot`).

---

### Step 1 — Local: build & push (har release par)

```bash
cd fabnet
docker login
cp .env.example .env   # if needed — set REACT_APP_* production URLs
./scripts/docker-build-push.sh
```

> **Mac (Apple Silicon) → Linux VPS:** Images must be built for `linux/amd64`. The script does this by default via `docker buildx`. If you previously pushed from a Mac without buildx, the server will fail with `no matching manifest for linux/amd64` — rebuild and push again.

Optional version tag:

```bash
IMAGE_TAG=v1.0.0 ./scripts/docker-build-push.sh
```

> Frontend URLs **build time** par image mein bake hoti hain. URL change = naya build + push.

---

### Step 2 — Server: copy config files

Server par `/opt/fabnet/` (ya apna path):

```
/opt/fabnet/
├── docker-compose.prod.pull.yml
├── .env
├── backend/.env.production
└── scripts/
    ├── server-setup.sh
    ├── server-ssl-init.sh
    └── server-pull-up.sh
```

**SCP example:**

```bash
scp docker-compose.prod.pull.yml user@server:/opt/fabnet/
scp .env user@server:/opt/fabnet/
scp backend/.env.production user@server:/opt/fabnet/backend/
scp scripts/server-setup.sh scripts/server-ssl-init.sh scripts/server-pull-up.sh scripts/reset-admin-password.sh user@server:/opt/fabnet/scripts/
```

> DNS A records (`panel`, `api`, `cdn`) server IP par point karo **before** SSL step.

---

### Step 3 — Server root `.env`

```env
MYSQL_ROOT_PASSWORD=STRONG_ROOT_PASSWORD_HERE
MYSQL_DATABASE=fabnet
MYSQL_USER=fabnet
MYSQL_PASSWORD=STRONG_DB_PASSWORD_HERE

DOCKER_REGISTRY=naveen2202
IMAGE_TAG=latest

# Domains + SSL (nginx proxy container handles routing + HTTPS)
PANEL_DOMAIN=panel.fabnetsystems.com
API_DOMAIN=api.fabnetsystems.com
CDN_DOMAIN=cdn.fabnetsystems.com
LETSENCRYPT_EMAIL=you@fabnetsystems.com
```

> Special characters in `MYSQL_PASSWORD` must be URL-encoded in `DATABASE_URL` (e.g. `$` → `%24`, `@` → `%40`).

---

### Step 4 — Server `backend/.env.production`

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://fabnet:STRONG_DB_PASSWORD_HERE@mysql:3306/fabnet
JWT_SECRET=YOUR_VERY_LONG_RANDOM_SECRET_MIN_32_CHARS
JWT_EXPIRES_IN=8h
CORS_ORIGIN=https://panel.fabnetsystems.com
LOG_LEVEL=info
BCRYPT_ROUNDS=12
```

---

### Step 5 — Server: one-command setup (pull + nginx + SSL)

```bash
cd /opt/fabnet
docker login
chmod +x scripts/*.sh

# Ensure ports 80/443 are free (stop host nginx if installed: systemctl stop nginx)
./scripts/server-setup.sh
```

This script:
1. Pulls all images (including `fabnet-proxy`)
2. Starts MySQL, backend, frontend, kdesigns, nginx proxy
3. Requests Let's Encrypt certs (if `LETSENCRYPT_EMAIL` is set)
4. Enables HTTPS on all three domains

HTTP only (skip SSL):

```bash
SKIP_SSL=1 ./scripts/server-setup.sh
```

SSL later:

```bash
./scripts/server-ssl-init.sh
```

---

### Step 6 — Har update par (server)

Local par naya code push karo (`./scripts/docker-build-push.sh`), phir server par:

```bash
cd /opt/fabnet
docker compose -f docker-compose.prod.pull.yml pull
docker compose -f docker-compose.prod.pull.yml up -d
```

Backend start par Prisma migrate auto chalti hai (`docker-entrypoint.sh`).

---

## Alternative: Server par git clone + build

Agar Docker Hub use nahi karna, purana flow ab bhi kaam karta hai.

### Step 1 — Code server par lao

```bash
git clone <your-repo-url> fabnet
cd fabnet
```

### Step 2 — Root `.env` banao (MySQL + frontend build URLs)

```bash
cp .env.example .env
nano .env
```

**Production `.env` example:**

```env
# MySQL (docker-compose.prod.yml mysql service)
MYSQL_ROOT_PASSWORD=STRONG_ROOT_PASSWORD_HERE
MYSQL_DATABASE=fabnet
MYSQL_USER=fabnet
MYSQL_PASSWORD=STRONG_DB_PASSWORD_HERE

# Frontend build-time URLs (browser se accessible hon)
REACT_APP_API_BASE_URL=https://api.fabnetsystems.com/api
REACT_APP_KDESIGNS_REMOTE_ENTRY_URL=https://cdn.fabnetsystems.com/kdesigns/remoteEntry.js
```

> **Note:** Frontend URLs browser se load hote hain — `localhost` ya internal Docker hostname mat use karo.

---

### Step 3 — Backend production env

Edit `backend/.env.production`:

```env
NODE_ENV=production
PORT=3000

# MySQL user/pass MUST match root .env MYSQL_* values
DATABASE_URL=mysql://fabnet:STRONG_DB_PASSWORD_HERE@mysql:3306/fabnet

# Generate: openssl rand -base64 48
JWT_SECRET=YOUR_VERY_LONG_RANDOM_SECRET_MIN_32_CHARS
JWT_EXPIRES_IN=8h

# Your live frontend domain
CORS_ORIGIN=https://panel.fabnetsystems.com

LOG_LEVEL=info
BCRYPT_ROUNDS=12
```

**DATABASE_URL format:**

```
mysql://USERNAME:PASSWORD@mysql:3306/DATABASE_NAME
         ↑              ↑        ↑           ↑
    root .env      root .env   Docker    root .env
    MYSQL_USER     MYSQL_PASS  service   MYSQL_DATABASE
                              name (always "mysql" inside Docker network)
```

---

### Step 4 — Frontend production env (reference)

Edit `frontend/.env.production` (Docker build ke liye reference; actual values root `.env` se aati hain):

```env
REACT_APP_API_BASE_URL=https://api.fabnetsystems.com/api
REACT_APP_KDESIGNS_REMOTE_ENTRY_URL=https://cdn.fabnetsystems.com/kdesigns/remoteEntry.js
```

---

### Step 5 — Build & start

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

### Step 6 — Verify

```bash
docker compose -f docker-compose.prod.yml ps
curl https://api.fabnetsystems.com/health
```

Browser: `https://panel.fabnetsystems.com`

---

## Server par change karne ki checklist

Har change ke liye **kaunsi file** edit karni hai:

| Kya change karna hai | File(s) | Restart / Rebuild |
|---------------------|---------|-------------------|
| DB username | `.env` → `MYSQL_USER` + `backend/.env.production` → `DATABASE_URL` | `down -v` + `up --build` (pehli baar) |
| DB password | `.env` → `MYSQL_PASSWORD` + `DATABASE_URL` | Same |
| DB name | `.env` → `MYSQL_DATABASE` + `DATABASE_URL` | Same |
| JWT secret | `backend/.env.production` → `JWT_SECRET` | `docker compose restart backend` |
| API domain | Rebuild frontend image locally + push | `docker-build-push.sh` then server `pull` |
| kdesigns CDN URL | Rebuild frontend image locally + push | Same |
| CORS (frontend domain) | `backend/.env.production` → `CORS_ORIGIN` | `restart backend` |
| New app version | Local `./scripts/docker-build-push.sh` | Server `pull` + `up -d` |
| SSL / reverse proxy | `.env` → `LETSENCRYPT_EMAIL` + domains | `./scripts/server-ssl-init.sh` |

---

## Database credentials change (important)

**Teen jagah sync rakho:**

1. **`fabnet/.env`** — MySQL container create karte waqt:
   ```env
   MYSQL_USER=fabnet
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=fabnet
   ```

2. **`backend/.env.production`** — Backend connect karta hai:
   ```env
   DATABASE_URL=mysql://fabnet:your_password@mysql:3306/fabnet
   ```

3. **Pehli baar credentials change** — purana volume delete karo:
   ```bash
   docker compose -f docker-compose.prod.yml down -v
   docker compose -f docker-compose.prod.yml up --build -d
   ```
   > `-v` se saara DB data delete hota hai. Backup pehle lo agar data hai.

---

## Nginx / HTTPS (Docker proxy — automatic)

Nginx reverse proxy runs as the **`proxy`** container. No host nginx install needed.

| Public URL | Internal service |
|------------|------------------|
| `https://panel.fabnetsystems.com` | `frontend:8080` |
| `https://api.fabnetsystems.com` | `backend:3000` |
| `https://cdn.fabnetsystems.com/kdesigns/` | `kdesigns:8080` |

**phpMyAdmin (internal only):** `http://127.0.0.1:8081` — SSH tunnel: `ssh -L 8081:127.0.0.1:8081 user@server`

**SSL renewal** (add to crontab, e.g. weekly):

```bash
0 3 * * 1 cd /opt/fabnet && ./scripts/server-ssl-renew.sh >> /var/log/fabnet-ssl-renew.log 2>&1
```

---

## Common commands (server — Docker Hub pull)

```bash
# First-time setup (pull + SSL)
./scripts/server-setup.sh

# Deploy update (after new images pushed to Docker Hub)
./scripts/server-pull-up.sh

# Status
docker compose -f docker-compose.prod.pull.yml ps

# Logs
docker compose -f docker-compose.prod.pull.yml logs -f backend
docker compose -f docker-compose.prod.pull.yml logs -f proxy

# Restart single service
docker compose -f docker-compose.prod.pull.yml restart backend

# Stop everything
docker compose -f docker-compose.prod.pull.yml down

# SSL only (if setup was HTTP-first)
./scripts/server-ssl-init.sh
```

## Common commands (server — git build alternative)

```bash
# Status
docker compose -f docker-compose.prod.yml ps

# Logs
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend

# Restart single service
docker compose -f docker-compose.prod.yml restart backend

# Stop everything
docker compose -f docker-compose.prod.yml down

# Update after git pull
git pull
docker compose -f docker-compose.prod.yml up --build -d
```

---

## Security checklist (production)

- [ ] `JWT_SECRET` — random, 32+ characters (`openssl rand -base64 48`)
- [ ] `MYSQL_ROOT_PASSWORD` — strong, unique
- [ ] `MYSQL_PASSWORD` — strong, unique
- [ ] Default seed passwords change karo (admin/supplier accounts)
- [ ] MySQL port 3306 public expose mat karo (prod compose mein already hidden)
- [ ] HTTPS enable karo (Let's Encrypt / Cloudflare)
- [ ] `CORS_ORIGIN` sirf apna frontend domain
- [ ] `.env` files git mein commit mat karo

---

## Local development env files

Local ke liye alag files use hoti hain (server wali mat copy karo):

| File | Use |
|------|-----|
| `fabnet/.env` | Docker Compose dev (MySQL credentials) |
| `backend/.env` | Backend without Docker (`localhost` MySQL) |
| `backend/.env.development` | Backend inside Docker dev |
| `frontend/.env` | Frontend `npm start` (port 3002) |

See [README.md](./README.md) for local run commands.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| White screen | kdesigns URL browser-accessible hai? Hard refresh `Cmd+Shift+R` |
| CORS error | `backend/.env.production` → `CORS_ORIGIN` frontend domain se match karo |
| DB connection failed | `DATABASE_URL` user/pass/database `.env` se match karo |
| Login 401 | No admin user in DB, or wrong password — run `./scripts/reset-admin-password.sh` |
| Frontend old API URL | Frontend rebuild karo (env build-time bake hoti hai) |

---

## Default seed users

On **first production deploy** (empty DB), seed runs automatically and creates:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fabnetsystems.com | Admin@123 |
| Supplier | supplier@fabnetsystems.com | Supplier@123 |

If admin login fails (DB already had users, or password was changed), reset on server:

```bash
cd /opt/fabnet
./scripts/reset-admin-password.sh
```

Or manually:

```bash
docker compose -f docker-compose.prod.pull.yml exec backend node prisma/reset-admin-password.js
```
