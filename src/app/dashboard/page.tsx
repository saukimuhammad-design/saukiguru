"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { 
  Plus, Loader2, BookOpen, Sparkles, 
  FileText, Presentation, HelpCircle, 
  Clipboard, CheckSquare, Image, 
  RotateCcw, Star, ArrowRight, 
  LogOut, User, Settings, ChevronDown
} from "lucide-react"
import { OUTPUT_TYPES, GRADE_OPTIONS, SUBJECT_OPTIONS, CURRICULUM_OPTIONS } from "@/lib/utils"
import { useMutation } from "@tanstack/react-query"

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"create" | "lessons">("create")
  const [formData, setFormData] = useState({
    subject: "",
    grade: "",
    topic: "",
    curriculum: "merdeka",
    standard: "",
  })

  const createLessonMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Gagal membuat lesson")
      return res.json()
    },
    onSuccess: (data: { lesson: { id: string } }) => {
      toast({ title: "Berhasil", description: "Lesson dibuat", variant: "success" })
      router.push(`/dashboard/lesson/${data.lesson.id}`)
      router.refresh()
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createLessonMutation.mutate(formData)
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary">
            <BookOpen className="h-7 w-7" />
            <span>GuruApp</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary">Dashboard</Link>
            <Link href="/dashboard/lessons" className="text-sm font-medium hover:text-primary">Lesson Saya</Link>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1">
              <LogOut className="h-4 w-4" />
              Keluar
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-2 mb-8 border-b" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === "create"}
            onClick={() => setActiveTab("create")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "create" 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-4 w-4 inline mr-1" />
            Buat Baru
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "lessons"}
            onClick={() => setActiveTab("lessons")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "lessons" 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="h-4 w-4 inline mr-1" />
            Lesson Saya
          </button>
        </div>

        {activeTab === "create" ? (
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  Generator Bahan Ajar
                </CardTitle>
                <CardDescription>
                  Isi detail pembelajaran, lalu pilih jenis output yang diinginkan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Mata Pelajaran *</Label>
                      <Select value={formData.subject} onValueChange={(v) => setFormData({...formData, subject: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih mata pelajaran" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUBJECT_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="grade">Kelas *</Label>
                      <Select value={formData.grade} onValueChange={(v) => setFormData({...formData, grade: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kelas" />
                        </SelectTrigger>
                        <SelectContent>
                          {GRADE_OPTIONS.map((g) => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topik Pembelajaran *</Label>
                    <Input
                      id="topic"
                      placeholder="Contoh: Pecahan, Fotosintesis, Teks Negosiasi, dll"
                      value={formData.topic}
                      onChange={(e) => setFormData({...formData, topic: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="curriculum">Kurikulum</Label>
                      <Select value={formData.curriculum} onValueChange={(v) => setFormData({...formData, curriculum: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kurikulum" />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRICULUM_OPTIONS.map((c) => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="standard">Capaian Pembelajaran (Opsional)</Label>
                    <Textarea
                      id="standard"
                      placeholder="Salin CP dari dokumen kurikulum, atau biarkan kosong untuk digenerate otomatis"
                      value={formData.standard}
                      onChange={(e) => setFormData({...formData, standard: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <Button type="submit" className="w-full lg:w-auto gap-2" size="lg" disabled={createLessonMutation.isPending}>
                    {createLessonMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Membuat...
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5" />
                        Buat Lesson & Generate RPP
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Jenis Output yang Tersedia</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    <Card key={type.value} className="p-4 text-center hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-sm font-medium">{type.label}</p>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Lesson Saya</CardTitle>
              <CardDescription>Daftar lesson yang sudah dibuat</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Belum ada lesson</h3>
                <p className="text-muted-foreground mb-4">Buat lesson pertama Anda di tab "Buat Baru"</p>
                <Button onClick={() => setActiveTab("create")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Lesson Baru
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}