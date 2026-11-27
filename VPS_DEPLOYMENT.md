# GuruApp VPS Deployment Guide

## Architecture Options

### Option A: Supabase Cloud + VPS for Ollama (RECOMMENDED)
- **Database/Auth**: Supabase Cloud (managed, free tier)
- **AI**: Ollama on VPS
- **App**: Next.js on VPS (or Vercel)
- **Pros**: Zero DB maintenance, Auth works out of box, free tier generous
- **Cost**: VPS only (~$6/mo)

### Option B: Fully Self-Hosted (Advanced)
- **Database**: PostgreSQL local
- **Auth**: Custom JWT or Supabase self-hosted (complex)
- **AI**: Ollama on VPS
- **App**: Next.js on VPS
- **Pros**: Full control, no external deps
- **Cons**: Must implement auth, RLS, realtime yourself

---

## Quick Start (Option A - Recommended)

### 1. Prerequisites
- VPS: Ubuntu 22.04+, 2GB+ RAM, 2 vCPU, 30GB+ SSD
- Domain (optional, for SSL) or use IP with self-signed cert
- Supabase Cloud project (free at supabase.com)

### 2. Prepare Supabase Cloud
1. Create project at https://supabase.com/dashboard
2. Go to **SQL Editor** → Run `supabase/schema.sql`
3. Go to **Authentication → Providers** → Enable Email
4. Go to **Settings → API** → Copy:
   - Project URL
   - Anon (public) key
   - Service role (secret) key

### 3. Deploy to VPS

```bash
# On your local machine
git clone https://github.com/saukimuhammad-design/saukiguru.git
cd saukiguru/guru-app

# Edit deploy script with your VPS IP
chmod +x deploy-vps.sh
./deploy-vps.sh YOUR_VPS_IP root
```

### 4. Configure Environment on VPS
```bash
ssh root@YOUR_VPS_IP
cd /opt/guruapp/guru-app
nano .env.production
# Fill in Supabase keys from step 2
docker-compose restart app
```

### 5. Access
- **App**: https://YOUR_VPS_IP (accept self-signed cert warning)
- **MinIO Console**: https://YOUR_VPS_IP:9001 (minioadmin / password from .env)
- **Ollama API**: https://YOUR_VPS_IP/v1 (proxied via Nginx)

---

## For Production Domain + SSL

```bash
# 1. Point domain A record to VPS IP
# 2. On VPS, run Certbot:
docker-compose run --rm certbot certonly --webroot -w /var/www/certbot -d yourdomain.com

# 3. Update nginx.conf server_name to yourdomain.com
# 4. Reload nginx:
docker-compose exec nginx nginx -s reload
```

---

## Ollama Model Management

```bash
# List models
docker-compose exec ollama ollama list

# Pull more models
docker-compose exec ollama ollama pull llama3.1:70b    # Needs 40GB+ RAM
docker-compose exec ollama ollama pull codellama:13b   # Code specialized
docker-compose exec ollama ollama pull mistral:7b      # Fast, good quality

# Remove model
docker-compose exec ollama ollama rm model_name
```

---

## Useful Commands

```bash
# View logs
docker-compose logs -f app
docker-compose logs -f ollama

# Restart services
docker-compose restart app
docker-compose restart

# Update app
cd /opt/guruapp/guru-app
git pull
docker-compose build --no-cache app
docker-compose up -d app

# Backup database
docker-compose exec postgres pg_dump -U guruapp guruapp > backup.sql

# Restore database
docker-compose exec -T postgres psql -U guruapp guruapp < backup.sql

# Check resource usage
docker stats
```

---

## Troubleshooting

### App won't start
```bash
docker-compose logs app
# Check .env.production has correct Supabase keys
```

### Ollama slow / OOM
- Use smaller model: `llama3.1:8b` (4.7GB) or `phi3:mini` (2.3GB)
- Add swap: `fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile`

### SSL cert warning (self-signed)
- Browser shows "Not Secure" - normal for self-signed
- Click "Advanced" → "Proceed unsafe"
- For production, use real domain + Certbot (see above)

### Database connection failed
- Verify Supabase project is active (not paused)
- Check IP allowlist in Supabase → Database → Settings
- VPS IP must be allowed or use 0.0.0.0/0 (less secure)

---

## File Structure on VPS

```
/opt/guruapp/
├── guru-app/
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── .env.production          # Your secrets
│   ├── nginx/
│   │   └── nginx.conf
│   ├── certbot/
│   │   ├── conf/                # SSL certs
│   │   └── www/                 # ACME challenges
│   └── supabase/
│       └── schema.sql           # DB schema
└── volumes/                     # Docker volumes (persistent)
    ├── postgres_data/
    ├── minio_data/
    └── ollama_data/
```

---

## Security Checklist

- [ ] Change all default passwords in `.env.production`
- [ ] Restrict SSH: `PermitRootLogin prohibit-password` + SSH keys only
- [ ] Firewall: `ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw enable`
- [ ] Fail2ban: `apt install fail2ban && systemctl enable --now fail2ban`
- [ ] Regular updates: `apt update && apt upgrade -y` (weekly)
- [ ] Monitor logs: `journalctl -u guruapp -f`