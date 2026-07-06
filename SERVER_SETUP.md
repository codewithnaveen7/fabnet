# FabNet — Server (Production) Setup Guide

Yeh document batata hai ki **production server** par kya-kya change karna hai aur kaunsi file kahan hai.

---

## Dev vs Prod — Quick Summary

| | Local (Dev) | Server (Prod) |
|---|-------------|---------------|
| **Command** | `docker compose up --build` | `docker compose -f docker-compose.prod.yml up --build -d` |
| **Compose file** | `docker-compose.yml` | `docker-compose.prod.yml` |
| **Root env** | `.env` | `.env` (strong secrets) |
| **Backend env** | `backend/.env.development` | `backend/.env.production` |
| **Frontend URLs** | `docker-compose.yml` build args | Root `.env` + rebuild frontend |
| **DB seed** | Yes (auto) | No |
| **MySQL port** | 3306 exposed | Internal only |

---

## Server par pehli baar setup

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
| API domain | Root `.env` → `REACT_APP_API_BASE_URL` | `docker compose build frontend && up -d frontend` |
| kdesigns CDN URL | Root `.env` → `REACT_APP_KDESIGNS_REMOTE_ENTRY_URL` | Rebuild frontend + kdesigns |
| CORS (frontend domain) | `backend/.env.production` → `CORS_ORIGIN` | `restart backend` |
| SSL / reverse proxy | Nginx/Caddy server config (outside repo) | Reload proxy |

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

## Nginx / reverse proxy (server par, repo ke bahar)

Typical setup:

| Public URL | Proxy to |
|------------|----------|
| `https://panel.fabnetsystems.com` | `localhost:3001` (frontend / React app) |
| `https://api.fabnetsystems.com` | `localhost:3000` (backend) |
| `https://cdn.fabnetsystems.com/kdesigns/` | `localhost:8080` (kdesigns) |

**phpMyAdmin (optional, internal only):** `http://127.0.0.1:8081` — prod compose mein sirf localhost par bind hai. Remote: `ssh -L 8081:127.0.0.1:8081 user@server` phir browser mein http://localhost:8081

Example Nginx snippet (backend):

```nginx
server {
    listen 443 ssl;
    server_name api.fabnetsystems.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Common commands (server)

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
| Login 401 | Backend logs check karo; seed prod mein nahi chalti — manually user banao |
| Frontend old API URL | Frontend rebuild karo (env build-time bake hoti hai) |

---

## Default seed users (development only)

Production par yeh automatically create **nahi** hote. Dev mein:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fabnetsystems.com | Admin@123 |
| Supplier | supplier@fabnetsystems.com | Supplier@123 |

Production par pehla admin manually create karo ya ek baar dev seed script carefully run karo.
