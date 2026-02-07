#!/bin/sh

echo "Starting deployment..."

# 1. Run the Environment Injection for Frontend
# We manually call the script we copied
if [ -f "/docker-entrypoint.d/40-inject-env.sh" ]; then
    echo "Injecting runtime env..."
    sh /docker-entrypoint.d/40-inject-env.sh
fi

# 2. Start Supervisor (which launches Node and Nginx)
exec supervisord -c /etc/supervisord.conf
