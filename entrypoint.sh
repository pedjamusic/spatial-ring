#!/bin/sh
set -e

echo "=== Starting deployment ==="

# 1. Run the Environment Injection for Frontend
if [ -f "/docker-entrypoint.d/40-inject-env.sh" ]; then
    echo "Running env injection script..."
    sh /docker-entrypoint.d/40-inject-env.sh

    # Verify the file was created
    if [ -f "/usr/share/nginx/html/env-config.js" ]; then
        echo "✓ env-config.js created successfully"
        cat /usr/share/nginx/html/env-config.js
    else
        echo "✗ ERROR: env-config.js was not created!"
    fi
else
    echo "✗ WARNING: /docker-entrypoint.d/40-inject-env.sh not found!"
fi

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
