#!/bin/sh
set -e

echo "=== Starting deployment ==="

# 1. Run the Environment Injection for Frontend
echo "Generating frontend runtime configuration..."
node /docker/inject-env.mjs
if [ ! -s "/usr/share/nginx/html/env-config.js" ]; then
    echo "✗ ERROR: env-config.js was not created!"
    exit 1
fi
echo "✓ env-config.js created successfully"

# 2. Check if API can start
echo "Checking API configuration..."
cd /app/api
if [ ! -f "src/app.js" ]; then
    echo "✗ ERROR: API source not found!"
    exit 1
fi
echo "✓ API source found"

# 3. Start Supervisor (which launches Node and Nginx)
echo "Starting supervisor..."
exec supervisord -c /etc/supervisord.conf
