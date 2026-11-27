#!/bin/bash
# GuruApp VPS Deployment Script
# Usage: ./deploy-vps.sh [IP_OR_DOMAIN] [SSH_USER]

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $*"; }
warn() { echo -e "${YELLOW}[$(date '+%H:%M:%S')]${NC} $*"; }
error() { echo -e "${RED}[$(date '+%H:%M:%S')]${NC} $*"; exit 1; }

# Config
VPS_IP="${1:-}"
SSH_USER="${2:-root}"
REPO_URL="https://github.com/saukimuhammad-design/saukiguru.git"
APP_DIR="/opt/guruapp"
BRANCH="main"

if [[ -z "$VPS_IP" ]]; then
    error "Usage: $0 <VPS_IP_OR_DOMAIN> [ssh_user]"
fi

log "Deploying GuruApp to $SSH_USER@$VPS_IP"

# 1. Test SSH connection
log "Testing SSH connection..."
ssh -o ConnectTimeout=10 -o BatchMode=yes "$SSH_USER@$VPS_IP" "echo 'SSH OK'" || error "SSH failed. Setup SSH key first: ssh-copy-id $SSH_USER@$VPS_IP"

# 2. Install Docker & Docker Compose on VPS
log "Installing Docker on VPS..."
ssh "$SSH_USER@$VPS_IP" << 'EOF'
    if ! command -v docker &> /dev/null; then
        curl -fsSL https://get.docker.com | sh
        systemctl enable --now docker
    fi
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        apt-get update && apt-get install -y docker-compose-plugin
    fi
    # Install git if needed
    command -v git &> /dev/null || apt-get update && apt-get install -y git curl wget
EOF

# 3. Clone/Update repo
log "Cloning/updating repository..."
ssh "$SSH_USER@$VPS_IP" << EOF
    mkdir -p $APP_DIR
    cd $APP_DIR
    if [[ -d .git ]]; then
        git fetch origin
        git reset --hard origin/$BRANCH
    else
        git clone -b $BRANCH $REPO_URL .
    fi
EOF

# 4. Generate self-signed SSL for IP-only
log "Generating self-signed SSL certificate..."
ssh "$SSH_USER@$VPS_IP" << EOF
    cd $APP_DIR/guru-app
    mkdir -p certbot/conf/live/$VPS_IP certbot/www
    openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
        -keyout certbot/conf/live/$VPS_IP/privkey.pem \
        -out certbot/conf/live/$VPS_IP/fullchain.pem \
        -subj "/CN=$VPS_IP" 2>/dev/null
    # Create dummy dhparams
    openssl dhparam -out certbot/conf/ssl-dhparams.pem 2048 2>/dev/null
    # Create options-ssl-nginx.conf
    cat > certbot/conf/options-ssl-nginx.conf << 'SSLEOF'
ssl_session_cache shared:le_nginx_SSL:10m;
ssl_session_timeout 1440m;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers off;
ssl_ciphers "ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384";
SSLEOF
EOF

# 5. Create nginx config for IP-only (no domain)
log "Creating nginx config for IP..."
ssh "$SSH_USER@$VPS_IP" << 'EOF'
    cat > /opt/guruapp/guru-app/nginx/nginx.conf << 'NGINXEOF'
# Nginx Configuration for GuruApp (IP-only with self-signed SSL)

user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    upstream guruapp {
        server app:3000;
        keepalive 32;
    }

    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;

    # HTTP -> HTTPS Redirect
    server {
        listen 80;
        server_name _;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$host$request_uri;
        }
    }

    # HTTPS Server (Self-signed)
    server {
        listen 443 ssl http2;
        server_name _;

        ssl_certificate /etc/letsencrypt/live/'"$VPS_IP"'/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/'"$VPS_IP"'/privkey.pem;
        include /etc/letsencrypt/options-ssl-nginx.conf;
        ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

        # Self-signed cert warning - browser will show warning
        # For production, use real domain + Certbot

        location /_next/static/ {
            proxy_pass http://guruapp;
            proxy_cache_valid 200 1y;
            add_header Cache-Control "public, max-age=31536000, immutable";
        }

        location /_next/image/ {
            proxy_pass http://guruapp;
            proxy_cache_valid 200 1y;
            add_header Cache-Control "public, max-age=31536000, immutable";
        }

        location /public/ {
            proxy_pass http://guruapp;
            proxy_cache_valid 200 1d;
            add_header Cache-Control "public, max-age=86400";
        }

        location /api/ {
            limit_req zone=api burst=20 nodelay;

            location /api/auth/ {
                limit_req zone=auth burst=5 nodelay;
                proxy_pass http://guruapp;
            }

            proxy_pass http://guruapp;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        location / {
            proxy_pass http://guruapp;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;

            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 120s;
        }

        location /api/health {
            access_log off;
            proxy_pass http://guruapp;
        }
    }
}
NGINXEOF
EOF

# 6. Create .env.production from template
log "Creating .env.production..."
ssh "$SSH_USER@$VPS_IP" << EOF
    cd $APP_DIR/guru-app
    if [[ ! -f .env.production ]]; then
        cat > .env.production << 'ENVEOF'
# GuruApp Production Environment
# Generated by deploy-vps.sh - EDIT WITH YOUR VALUES

# Database (PostgreSQL local)
POSTGRES_PASSWORD=$(openssl rand -base64 32)
DATABASE_URL=postgresql://guruapp:\${POSTGRES_PASSWORD}@postgres:5432/guruapp

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=$(openssl rand -base64 32)

# Supabase (using local Postgres - need Supabase-compatible API layer)
# For now, use managed Supabase cloud instead
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI / Ollama
OPENAI_API_KEY=ollama
OPENAI_BASE_URL=http://ollama:11434/v1
MODEL_NAME=llama3.1:8b

# App
NEXT_PUBLIC_APP_URL=https://$VPS_IP
NODE_ENV=production

# Optional: JWT Secret for custom auth
JWT_SECRET=$(openssl rand -base64 64)
ENVEOF
        warn "Created .env.production.template - EDIT IT with real values!"
    fi
EOF

# 7. Pull Ollama model
log "Pulling Ollama model (llama3.1:8b)..."
ssh "$SSH_USER@$VPS_IP" << 'EOF'
    cd /opt/guruapp/guru-app
    docker-compose up -d ollama
    # Wait for ollama to be ready
    for i in {1..30}; do
        if docker-compose exec -T ollama curl -sf http://localhost:11434/api/tags >/dev/null 2>&1; then
            break
        fi
        sleep 2
    done
    docker-compose exec -T ollama ollama pull llama3.1:8b || warn "Ollama pull failed - will retry on app start"
EOF

# 8. Build and start all services
log "Building and starting all services..."
ssh "$SSH_USER@$VPS_IP" << EOF
    cd $APP_DIR/guru-app
    docker-compose build --no-cache app
    docker-compose up -d
EOF

# 9. Wait for health checks
log "Waiting for services to be healthy..."
ssh "$SSH_USER@$VPS_IP" << 'EOF'
    cd /opt/guruapp/guru-app
    for i in {1..60}; do
        if curl -kfs https://localhost/api/health >/dev/null 2>&1; then
            echo "✓ App is healthy"
            break
        fi
        sleep 2
    done
EOF

# 10. Setup systemd for auto-start
log "Setting up systemd service..."
ssh "$SSH_USER@$VPS_IP" << 'EOF'
    cat > /etc/systemd/system/guruapp.service << 'SYSTEMEOF'
[Unit]
Description=GuruApp Docker Compose
Requires=docker.service
After=docker.service network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/guruapp/guru-app
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
SYSTEMEOF
    systemctl daemon-reload
    systemctl enable guruapp
EOF

log "Deployment complete!"
echo
echo "============================================"
echo "  GuruApp deployed to https://$VPS_IP"
echo "============================================"
echo
echo "Next steps:"
echo "1. Edit .env.production on VPS with real Supabase keys:"
echo "   ssh $SSH_USER@$VPS_IP 'nano /opt/guruapp/guru-app/.env.production'"
echo "2. Restart after editing: ssh $SSH_USER@$VPS_IP 'cd /opt/guruapp/guru-app && docker-compose restart app'"
echo "3. Access app: https://$VPS_IP (browser will show self-signed cert warning)"
echo "4. For production SSL: Point domain to $VPS_IP, run Certbot:"
echo "   docker-compose run --rm certbot certonly --webroot -w /var/www/certbot -d yourdomain.com"
echo
echo "Useful commands:"
echo "  Logs:       ssh $SSH_USER@$VPS_IP 'cd /opt/guruapp/guru-app && docker-compose logs -f'"
echo "  Restart:    ssh $SSH_USER@$VPS_IP 'systemctl restart guruapp'"
echo "  Update:     ./deploy-vps.sh $VPS_IP $SSH_USER"
echo "  Ollama:     ssh $SSH_USER@$VPS_IP 'docker-compose exec ollama ollama list'"