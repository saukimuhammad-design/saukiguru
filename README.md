# GuruApp - Asisten Bahan Ajar Guru Indonesia

Aplikasi web untuk guru membuat RPP, Slide, Soal, LKS, Rubrik, Media Pembelajaran, Program Remedial & Enrichment dengan AI (OpenAI/Ollama). Dibangun dengan Next.js 14, Supabase, TypeScript, Tailwind CSS.

## ✨ Fitur Utama

- **8 Jenis Output** dari 1 input: RPP, Slide, Soal, LKS, Rubrik, Media, Remedial, Enrichment
- **Kurikulum Indonesia**: Merdeka, KTSP, Cambridge, IB
- **AI-Powered**: OpenAI GPT-4o-mini (default) atau model lokal via Ollama
- **Editor JSON** visual untuk edit hasil generate
- **Export** ke JSON/Markdown
- **Multi-user** dengan Supabase Auth (Email/Password, OAuth Google/GitHub)
- **Self-hostable**: Deploy ke Vercel, Cloudflare Pages, VPS (Coolify/CapRover/Docker)
- **Data Milik Anda**: Database PostgreSQL di Supabase project Anda

## 🚀 Quick Start (Development)

### Prasyarat
- Node.js 18+
- pnpm (recommended) atau npm/yarn
- Supabase account (gratis)
- OpenAI API key (gratis $5 credit baru)

### 1. Clone & Install
```bash
cd guru-app
pnpm install
# atau npm install
```

### 2. Setup Supabase
1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **SQL Editor** → jalankan isi `supabase/schema.sql`
3. Buka **Authentication** → **Providers** → enable Email, Google, GitHub
4. Di **URL Configuration** tambahkan:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`
5. Ambil **Project URL** dan **Anon Key** dari **Settings** → **API**

### 3. Setup Environment
```bash
cp .env.example .env.local
```

Isi `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Service role key (secret)

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development
```bash
pnpm dev
# Buka http://localhost:3000
```

## 🏗 Deploy Production

### Opsi A: Vercel (Paling Mudah, Gratis)
1. Push ke GitHub
2. Import di [vercel.com](https://vercel.com)
3. Tambahkan Environment Variables (sama seperti `.env.local`)
4. Deploy → Done!

### Opsi B: Cloudflare Pages + Workers (Edge, Murah)
```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Setup D1 Database (SQLite) & R2 Storage
# Lihat docs/cloudflare-setup.md

# Deploy
wrangler pages deploy .vercel/output/static --project-name=guru-app
```

### Opsi C: VPS + Docker (Full Control, AI Lokal)
```bash
# Server: Ubuntu 22.04+, 2GB RAM minimal
# Install Docker & Docker Compose

# Clone repo
git clone https://github.com/username/guru-app.git
cd guru-app

# Copy env
cp .env.example .env
# Edit .env dengan nilai production

# Build & Run
docker compose up -d --build

# Setup Nginx reverse proxy + SSL (Certbot)
# Lihat docs/vps-setup.md
```

**Docker Compose Include:**
- Next.js App
- PostgreSQL (Supabase alternative)
- MinIO (S3-compatible storage)
- Ollama (AI lokal: llama3.1, qwen2.5, dll)
- Nginx (reverse proxy)

### Opsi D: Coolify/CapRover (Self-hosted PaaS)
1. Install Coolify di VPS
2. Connect GitHub repo
3. Set environment variables
4. Deploy → Auto SSL, auto deploy on push

## 🤖 AI Lokal (Ollama) - Gratis & Privat

Ganti OpenAI ke model lokal untuk biaya $0 dan data tidak keluar server:

```bash
# Di VPS dengan Docker Compose
# Ollama otomatis jalan di port 11434

# Pull model (pilih satu):
docker exec -it ollama ollama pull llama3.1:8b      # 4.7GB, recommended
docker exec -it ollama ollama pull qwen2.5:7b       # 4.4GB, bagus untuk Indonesia
docker exec -it ollama ollama pull gemma2:9b        # 5.4GB, Google

# Update .env
OPENAI_API_KEY=ollama
OPENAI_BASE_URL=http://ollama:11434/v1
MODEL_NAME=llama3.1:8b
```

## 📁 Struktur Project

```
guru-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # Login, Signup, Logout
│   │   │   ├── generate/      # AI Generation
│   │   │   └── lessons/       # CRUD Lessons
│   │   ├── auth/              # Auth Pages
│   │   ├── dashboard/         # Dashboard Pages
│   │   ├── globals.css        # Global Styles
│   │   ├── layout.tsx         # Root Layout
│   │   ├── page.tsx           # Landing Page
│   │   └── providers.tsx      # React Query Provider
│   ├── components/
│   │   └── ui/                # shadcn/ui Components
│   ├── hooks/
│   │   └── use-toast.ts       # Toast Hook
│   ├── lib/
│   │   ├── openai.ts          # OpenAI Client
│   │   ├── prompts.ts         # System Prompts
│   │   ├── supabase/          # Supabase Clients & Types
│   │   └── utils.ts           # Utilities
│   └── middleware.ts          # Auth Middleware
├── supabase/
│   └── schema.sql             # Database Schema
├── docker-compose.yml         # Self-host Stack
├── Dockerfile                 # Container Image
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── .env.example
```

## 🔧 Customization

### Tambah Output Type Baru
1. Tambah di `src/lib/utils.ts` → `OUTPUT_TYPES`
2. Tambah prompt di `src/lib/prompts.ts` → `PROMPTS`
3. Tambah renderer di `src/app/dashboard/lesson/[id]/page.tsx` → `RenderedContent`
4. Update database enum di `supabase/schema.sql` (run migration)

### Ganti Model AI
```typescript
// src/lib/openai.ts
export const MODELS = {
  fast: 'gpt-4o-mini',      // Default: cepat, murah
  smart: 'gpt-4o',          // Lebih cerdas
  cheap: 'gpt-3.5-turbo',   // Termurah
} as const
```

### Styling
- Tailwind CSS + CSS Variables (shadcn/ui style)
- Edit `src/app/globals.css` untuk warna/theme
- Dark mode otomatis via `class` strategy

## 🔐 Security Checklist Production

- [ ] Gunakan `SUPABASE_SERVICE_ROLE_KEY` hanya di server-side
- [ ] Enable RLS di semua tabel (sudah include di schema)
- [ ] Set `NEXT_PUBLIC_APP_URL` ke domain production
- [ ] Configure CORS di Supabase untuk domain Anda
- [ ] Gunakan HTTPS (Vercel/Cloudflare auto, VPS setup Nginx + Certbot)
- [ ] Rate limit API (Supabase Edge Functions atau middleware)
- [ ] Monitor logs & errors (Sentry, Vercel Analytics, dll)

## 📝 License

MIT License - Bebas digunakan, dimodifikasi, didistribusikan untuk keperluan pendidikan maupun komersial.

## 🤝 Kontribusi

PR welcome! Beberapa area yang butuh bantuan:
- [ ] Unit/Integration tests
- [ ] PDF/DOCX export (pakai `@react-pdf/renderer` atau `docx`)
- [ ] Real-time collaboration (Supabase Realtime)
- [ ] Mobile app (React Native/Expo)
- [ ] More AI models (Gemini, Claude, local GGUF)
- [ ] Indonesian language optimization

## 📞 Support

- **Issues**: GitHub Issues
- **Diskusi**: GitHub Discussions
- **Email**: your-email@domain.com

---

**Dibangun untuk guru Indonesia** 🇮🇩  
*Hemat waktu administrasi, fokus pada yang penting: mengajar.*