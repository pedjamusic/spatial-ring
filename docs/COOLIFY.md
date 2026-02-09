# Coolify Git Source Deployment Guide

Deploy Spatial Ring on [Coolify](https://coolify.io) as two separate applications built from the same Git repo. The web app's nginx reverse-proxies API calls to the API container over Docker's internal network — everything stays on a single public domain with no CORS complexity.

For the single-container Docker deployment option, see **[DEPLOY.md](DEPLOY.md)**.

---

## Architecture

```
Browser → Cloudflare Tunnel → Coolify Traefik → spatial-web (nginx :80)
                                                   ├── /              → static files
                                                   ├── /api/*         → proxy to spatial-api:3000
                                                   ├── /auth/*        → proxy to spatial-api:3000
                                                   └── /uploads/*     → proxy to spatial-api:3000
```

Both containers communicate over Coolify's internal Docker network using service aliases.

---

## Prerequisites

- Coolify instance with access to your Git repo
- PostgreSQL database (Coolify's built-in Postgres works)
- Cloudflare Tunnel (or any reverse proxy) for public access

---

## Step 1: Create a Coolify Project

Create a single project (e.g., "Spatial Ring"). **Both applications must be in the same project** so they share a Docker network and can reach each other by hostname.

---

## Step 2: Add PostgreSQL Database

Add a PostgreSQL database resource to the project. Note the connection string — you'll need it for the API's `DATABASE_URL`.

---

## Step 3: Create the API Application (`spatial-api`)

| Setting | Value |
|---|---|
| Source | Git repository (same repo) |
| Build Pack | Nixpacks |
| Base Directory | `/` |
| Publish Directory | `/` |
| Install Command | `npm ci && npm run db:generate --workspace=api` |
| Build Command | `true` |
| Start Command | `npm run db:migrate --workspace=api && node api/src/server.js` |
| Port | `3000` |
| Network Alias | `spatial-api` |

### Environment Variables

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@<db-host>:5432/postgres` | Use Coolify's internal DB hostname |
| `JWT_SECRET` | (random string) | Generate with `openssl rand -base64 384` |
| `BCRYPT_COST` | `12` | Optional, default is 12 |
| `NODE_ENV` | `production` | |
| `CORS_ALLOWED_ORIGINS` | `https://your-domain.com` | Your public frontend URL |

### Domain

Assign an internal domain only (e.g., `http://spatial-api.192.168.1.5.sslip.io`). The API is not accessed directly by browsers — it's reached through the web container's nginx proxy.

---

## Step 4: Create the Web Application (`spatial-web`)

| Setting | Value |
|---|---|
| Source | Git repository (same repo) |
| Build Pack | Nixpacks |
| Static Site | **Yes** (checked) |
| Base Directory | `/` |
| Publish Directory | `/web/dist` |
| Install Command | `npm ci` |
| Build Command | `npm run build --workspace=web` |
| Port | `80` |
| Network Alias | `spatial-web` |

### Environment Variables

**Do NOT set `VITE_API_BASE_URL`**. Leave it empty/unset so the frontend uses relative URLs (`/api/...`) which nginx proxies to the API container.

### Domain

Assign your public domain (e.g., `https://demo.toodear.rocks`).

### Nginx Configuration

In Coolify → spatial-web → General → Custom Nginx Configuration:

```nginx
server {
    listen 80;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Proxy headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_cache_bypass $http_upgrade;

    # API reverse proxy (no trailing slash — preserves /api/ prefix)
    location /api/ {
        proxy_pass http://spatial-api:3000;
    }

    # Auth reverse proxy
    location /auth/ {
        proxy_pass http://spatial-api:3000;
    }

    # Uploaded files reverse proxy
    location /uploads/ {
        proxy_pass http://spatial-api:3000;
    }

    # Runtime config placeholder (env-config.js doesn't exist in static builds)
    location = /env-config.js {
        default_type application/javascript;
        return 200 '// no runtime config';
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

> **Key detail:** `proxy_pass http://spatial-api:3000` uses the API container's Docker network alias. Do NOT use `127.0.0.1:3000` — that's the web container's own loopback, where no API is running.

---

## Step 5: Cloudflare Tunnel (Optional)

If using Cloudflare Tunnel for public access, you only need **one route**:

| Hostname | Service | TLS Verify |
|---|---|---|
| `demo.toodear.rocks` | `https://localhost:443` | Off |

You do **not** need a separate `api.demo.toodear.rocks` route. All API traffic goes through the web container's nginx proxy on the same domain.

---

## Deploying Updates

1. Push to your Git repo
2. Coolify auto-deploys (or manually trigger)
3. If changing environment variables: **use "Rebuild without cache"** from the dropdown next to the Redeploy button (not just Redeploy)

---

## Troubleshooting

### `SyntaxError: Unexpected token '<'` in env-config.js
**Cause:** `env-config.js` doesn't exist in static builds. Without the `location = /env-config.js` nginx block, the SPA fallback serves `index.html` as JavaScript.
**Fix:** Add the `return 200 '// no runtime config'` location block shown above.

### 502 Bad Gateway on login/API calls
**Cause:** nginx can't reach the API container.
**Checks:**
- Are both apps in the **same Coolify project**? (required for shared Docker network)
- Is `proxy_pass` set to `http://spatial-api:3000`? (not `127.0.0.1`)
- Is the API container running? Check logs in Coolify.
- Test connectivity: `sudo docker exec <web-container> sh -c "wget -O- http://spatial-api:3000/ 2>&1"`

### 500 Internal Server Error
**Cause:** Usually CORS rejection.
**Fix:** Add your public frontend URL to `CORS_ALLOWED_ORIGINS` on the API app.

### API URL still baked into bundle after removing env var
**Cause:** Nixpacks cached the old build. Vite bakes `VITE_*` env vars into the JS bundle at build time.
**Fix:** Deploy using **"Rebuild without cache"** (dropdown next to Redeploy button). Verify with:
```bash
sudo docker exec <web-container> sh -c "grep 'your-old-api-url' /usr/share/nginx/html/assets/*.js && echo 'STILL CACHED' || echo 'CLEAN'"
```

### Coolify didn't save my settings
**Cause:** Coolify may not persist changes when navigating to a different settings tab before saving.
**Fix:** Always click Save on the current tab before navigating away. Verify settings after saving.

### Containers can't reach each other
**Verify they share a network:**
```bash
sudo docker inspect <api-container> --format '{{json .NetworkSettings.Networks}}' | python3 -m json.tool
sudo docker inspect <web-container> --format '{{json .NetworkSettings.Networks}}' | python3 -m json.tool
```
Both should show the same `NetworkID`. If not, move them into the same Coolify project and redeploy.
