import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BookOpen, Sparkles, Zap, FileText, 
  Presentation, HelpCircle, Clipboard, 
  CheckSquare, Image, RotateCcw, Star,
  ArrowRight, Shield, Users, GraduationCap
} from "lucide-react"
import { OUTPUT_TYPES } from "@/lib/utils"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              <span>Beta: AI Generator untuk Guru Indonesia</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
              Bahan Ajar Lengkap dalam
              <span className="text-primary"> Hitungan Menit</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Generator RPP, Slide, Soal, LKS, Rubrik, dan Media Pembelajaran 
              dengan AI yang memahami Kurikulum Merdeka & KTSP. Hemat waktu, fokus mengajar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/login">
                <Button size="xl" className="gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Mulai Gratis
                </Button>
              </Link>
              <Link href="#features">
                <Button size="xl" variant="outline" className="gap-2">
                  Lihat Fitur <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Semua yang Guru Butuhkan</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Delapan jenis output dari satu input. Konsisten, terstruktur, siap pakai.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {OUTPUT_TYPES.map((type) => {
              const Icon = {
                'file-text': FileText,
                'presentation': Presentation,
                'help-circle': HelpCircle,
                'clipboard': Clipboard,
                'check-square': CheckSquare,
                'image': Image,
                'rotate-ccw': RotateCcw,
                'star': Star,
              }[type.icon]
              return (
                <Card key={type.value} className="hover:shadow-lg transition-shadow h-full">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{type.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Generate otomatis dengan standar kurikulum Indonesia
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Cara Kerja</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Dari ide ke bahan ajar lengkap dalam 3 langkah
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center relative">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-foreground">1</div>
              <h3 className="text-xl font-semibold mb-2">Isi Topik</h3>
              <p className="text-muted-foreground">Mata pelajaran, kelas, topik, kurikulum, dan CP</p>
            </div>
            <div className="text-center relative">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-foreground">2</div>
              <h3 className="text-xl font-semibold mb-2">Pilih Output</h3>
              <p className="text-muted-foreground">RPP, Slide, Soal, LKS, Rubrik, Media, Remedial, Enrichment</p>
            </div>
            <div className="text-center relative">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-foreground">3</div>
              <h3 className="text-xl font-semibold mb-2">Edit & Ekspor</h3>
              <p className="text-muted-foreground">Sunting di editor visual, ekspor PDF/DOCX, simpan ke cloud</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-6">
              <Zap className="h-10 w-10 text-primary mb-4" />
              <CardTitle className="text-xl">Hemat 90% Waktu</CardTitle>
              <CardDescription>
                RPP yang biasanya 2-3 jam, sekarang <strong>10-15 menit</strong>. 
                Fokus pada pengajaran, bukan administrasi.
              </CardDescription>
            </Card>
            <Card className="p-6">
              <Shield className="h-10 w-10 text-primary mb-4" />
              <CardTitle className="text-xl">Sesuai Standar</CardTitle>
              <CardDescription>
                Mengikuti format <strong>Kurikulum Merdeka</strong> & KTSP. 
                CP, TP, ATP, diferenciasi, asesmen otomatis terisi.
              </CardDescription>
            </Card>
            <Card className="p-6">
              <Users className="h-10 w-10 text-primary mb-4" />
              <CardTitle className="text-xl">Milikmu Sepenuhnya</CardTitle>
              <CardDescription>
                Data tersimpan di <strong>Supabase project kamu</strong>. 
                Deploy ke Vercel/Cloudflare/VPS sendiri. Full control.
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Siap Menghemat Waktu Administrasi?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Bergabung dengan ribuan guru yang sudah memakai AI untuk bahan ajar. 
            Gratis untuk memulai, tidak perlu kartu kredit.
          </p>
          <Link href="/auth/signup">
            <Button size="xl" variant="secondary" className="gap-2">
              <Sparkles className="h-5 w-5" />
              Daftar Sekarang
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Dibangun untuk guru Indonesia dengan Next.js + Supabase + OpenAI</p>
          <p className="mt-2">Open source • Self-hostable • Data milik Anda</p>
        </div>
      </footer>
    </div>
  )
}
