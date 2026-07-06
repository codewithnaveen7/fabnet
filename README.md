# FabNet Systems

Login + dashboard app with Node.js, MySQL (Prisma), React, and kdesigns (Module Federation).

## Quick start (Docker)

```bash
cd fabnet
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:3000/api |
| kdesigns remote | http://localhost:8080/remoteEntry.js |
| phpMyAdmin | http://localhost:8081 |

### Seed accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fabnetsystems.com | Admin@123 |
| Supplier | supplier@fabnetsystems.com | Supplier@123 |

**phpMyAdmin login (Docker dev):** http://localhost:8081 — user `root` / password from `.env` → `MYSQL_ROOT_PASSWORD` (default `fabnet_root`), database `fabnet_dev`.

## Local development (no Docker)

```bash
# 1. MySQL running locally, then:
cd backend && cp .env.example .env && npm install && npm run db:migrate && npm run db:seed && npm run dev

# 2. kdesigns remote
cd kdesigns && npm start   # :3036

# 3. Frontend host
cd frontend && npm install && npm start   # :3002
```

## Production

See **[SERVER_SETUP.md](./SERVER_SETUP.md)** for full server deployment guide — env files, DB credentials, nginx, checklist.

```bash
cp .env.example .env   # set strong secrets
# Edit backend/.env.production
docker compose -f docker-compose.prod.yml up --build -d
```

## Environment files

| File | Purpose |
|------|---------|
| `.env` | Local Docker Compose (MySQL creds) |
| `backend/.env` | Local backend without Docker |
| `backend/.env.development` | Backend inside Docker dev |
| `backend/.env.production` | Backend on production server |
| `frontend/.env` | Local frontend `npm start` |
