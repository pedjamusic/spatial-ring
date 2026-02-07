# Production Deployment Guide

Spatial Ring supports two deployment modes. Choose the one that fits your infrastructure.

---

## Option A: Docker (Single Container) — Recommended

Everything runs in one container: Nginx serves the frontend and reverse-proxies to the Node.js API. All requests stay on the same domain — no CORS configuration needed.

### Environment Variables

```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname  # Required
JWT_SECRET=<random-string>     # Required - generate with: openssl rand -base64 384
BCRYPT_COST=12                 # Optional (default: 12)
NODE_ENV=production
PORT=3000                      # Internal API port (nginx proxies to this)
VITE_API_BASE_URL=             # Leave EMPTY for single-container setup
```

> **Important:** `VITE_API_BASE_URL` must be empty (or unset). The frontend will use relative URLs (`/api/...`, `/auth/...`) which nginx proxies internally. No CORS needed.

### Docker Compose

```yaml
services:
  spatial-ring:
    image: pedjamusic/spatial-ring:latest
    restart: unless-stopped
    ports:
      - '80:80'
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/dbname
      - JWT_SECRET=your-secret-here
      - BCRYPT_COST=12
      - NODE_ENV=production
      - PORT=3000
      - VITE_API_BASE_URL=
```

### Build from Source

```bash
docker build -t spatial-ring .
docker run -p 80:80 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="$(openssl rand -base64 384)" \
  spatial-ring
```

### How It Works

```
Browser → your-domain.com
         ├── /              → Nginx serves frontend (static files)
         ├── /api/*         → Nginx proxies to Node.js API (port 3000)
         ├── /auth/*        → Nginx proxies to Node.js API (port 3000)
         └── /uploads/*     → Nginx proxies to Node.js API (port 3000)
```

---

## Option B: Git Source (Separate Services)

Frontend and API run as separate services on different domains or ports. This is common with platforms like Coolify, Railway, or Vercel that build from your Git repo. CORS configuration is required.

### Environment Variables — API

```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname  # Required
JWT_SECRET=<random-string>     # Required - generate with: openssl rand -base64 384
BCRYPT_COST=12                 # Optional (default: 12)
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com  # Required - your frontend URL(s)
NODE_ENV=production
PORT=3000
```

### Environment Variables — Frontend

```bash
VITE_API_BASE_URL=https://your-api-domain.com  # Required - API base URL (no trailing slash, no /api suffix)
```

> **Important:** Do NOT include `/api` in the URL. The frontend appends `/api` automatically.
> - Correct: `https://api.example.com`
> - Wrong: `https://api.example.com/api`

### How It Works

```
Browser → frontend.example.com     (serves React app)
    └── API calls → api.example.com/api/*   (cross-origin, requires CORS)
```

### CORS Checklist

- `CORS_ALLOWED_ORIGINS` must include your **frontend** domain (where users visit)
- Multiple origins: comma-separated, no spaces
- Must match exactly (protocol + domain + port)

```bash
# Example: frontend at example.com, API at api.example.com
CORS_ALLOWED_ORIGINS=https://example.com,https://www.example.com
```

---

## Container Architecture (Docker mode)

The Docker container runs three processes managed by Supervisor:
- **Nginx** (port 80) — Serves static frontend + reverse proxy to API
- **Node.js API** (port 3000) — Express server with Prisma ORM
- **Supervisor** — Process manager for both services

### File Locations
- Frontend: `/usr/share/nginx/html/`
- API: `/app/api/`
- Runtime config: `/usr/share/nginx/html/env-config.js` (generated at startup)

### Startup Flow

1. **Entrypoint** runs `inject-env.sh` to generate `env-config.js` from `VITE_*` env vars
2. **Supervisor** starts Node API and Nginx
3. **Nginx** proxies `/api/*`, `/auth/*`, `/uploads/*` to the API

---

## Troubleshooting

### Error: "Unexpected token '<'" in env-config.js
- **Cause**: `env-config.js` wasn't generated at startup
- **Fix**: Check container logs — the entrypoint should log its generation
- **Verify**: `docker exec <container> cat /usr/share/nginx/html/env-config.js`

### Error: 502 Bad Gateway
- **Cause**: Node API crashed at startup
- **Fix**: Check if `JWT_SECRET` is set (required — API throws if missing)
- **Fix**: Check if `DATABASE_URL` is valid and reachable
- **Debug**: `docker logs <container>`

### Error: CORS / Preflight 404
- **If using Docker (Option A)**: Set `VITE_API_BASE_URL=` (empty). No CORS needed.
- **If using Git Source (Option B)**: Add your frontend domain to `CORS_ALLOWED_ORIGINS`
- **Common mistake**: Domain mismatch (e.g., `.com` vs `.rocks`, missing `https://`)

### Error: Double `/api/api/` in URLs
- **Cause**: `VITE_API_BASE_URL` includes `/api` suffix
- **Fix**: Set it to just the domain: `https://api.example.com` (no `/api`)

### Error: Database connection failed
- **Cause**: `DATABASE_URL` invalid or database unreachable
- **Fix**: Verify connection string and network access from container

---

## Logs

```bash
# View logs
docker logs <container-id>

# Follow logs in real-time
docker logs -f <container-id>

# Successful startup should show:
#   === Starting deployment ===
#   ✓ env-config.js created successfully
#   ✓ API source found
#   Starting supervisor...
#   🚀 API Server is running on http://localhost:3000
```
