# Production Deployment Guide

## Environment Variables Required

The following environment variables **must** be set in your deployment platform (e.g., Coolify):

### API (Backend)
```bash
DATABASE_URL=prisma+postgres://...  # Prisma Accelerate connection string
JWT_SECRET=<512-char-random-string>  # REQUIRED - generate with: openssl rand -base64 384
BCRYPT_COST=12
CORS_ALLOWED_ORIGINS=https://demo.toodear.rocks,https://api.demo.toodear.rocks
NODE_ENV=production
PORT=3000  # Internal API port (nginx proxies to this)
```

### Frontend (Web)
```bash
VITE_API_BASE_URL=https://api.demo.toodear.rocks  # Your API domain (no trailing slash)
```

## Container Architecture

The Docker container runs:
- **Nginx** (port 80) - Serves static frontend + reverse proxy to API
- **Node.js API** (port 3000) - Express server with Prisma
- **Supervisor** - Process manager for both services

### File Locations
- Frontend: `/usr/share/nginx/html/` (built from `web/dist`)
- API: `/app/api/` (source code)
- Runtime config: `/usr/share/nginx/html/env-config.js` (generated at startup)

## Startup Flow

1. **Entrypoint** (`/entrypoint.sh`)
   - Runs `/docker-entrypoint.d/40-inject-env.sh` to generate `env-config.js`
   - Validates API source files
   - Starts supervisor

2. **Supervisor** (`/etc/supervisord.conf`)
   - Starts Node API: `node /app/api/src/server.js`
   - Starts Nginx: `nginx -g "daemon off;"`

3. **Nginx** (`/etc/nginx/http.d/default.conf`)
   - Proxies `/api/*` → `http://127.0.0.1:3000`
   - Proxies `/auth/*` → `http://127.0.0.1:3000`
   - Proxies `/uploads/*` → `http://127.0.0.1:3000`
   - Serves frontend for all other routes

## Troubleshooting

### Error: "Unexpected token '<'" in env-config.js
- **Cause**: `env-config.js` wasn't generated or nginx returned 404
- **Fix**: Check container logs for entrypoint output
- **Verify**: `VITE_API_BASE_URL` is set in container environment

### Error: 502 Bad Gateway
- **Cause**: Node API isn't running or crashed at startup
- **Fix**: Check if `JWT_SECRET` is set (required - API throws if missing)
- **Fix**: Check supervisor logs: `docker logs <container>`

### Error: CORS issues
- **Cause**: Frontend domain not in `CORS_ALLOWED_ORIGINS`
- **Fix**: Add your frontend URL to the env var (comma-separated)

### Error: Database connection failed
- **Cause**: `DATABASE_URL` invalid or Prisma Accelerate down
- **Fix**: Verify connection string format and network access

## Building Locally

```bash
docker build -t spatial-ring .
docker run -p 8080:80 \
  -e DATABASE_URL="..." \
  -e JWT_SECRET="..." \
  -e VITE_API_BASE_URL="https://api.demo.toodear.rocks" \
  spatial-ring
```

## Logs

All output goes to stdout/stderr for Docker:
```bash
# View all logs
docker logs <container-id>

# Follow logs
docker logs -f <container-id>

# Filter by service
docker logs <container-id> 2>&1 | grep "node-api"
docker logs <container-id> 2>&1 | grep "nginx"
```
