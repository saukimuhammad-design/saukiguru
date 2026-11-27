"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { 
  ArrowLeft, Loader2, Download, Copy, 
  FileText, Presentation, HelpCircle, 
  Clipboard, CheckSquare, Image, 
  RotateCcw, Star, Sparkles, 
  Edit, Trash2, Eye, MoreHorizontal
} from "lucide-react"
import { OUTPUT_TYPES, formatRelativeTime } from "@/lib/utils"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { OutputRenderer } from "./output-renderer"
import { LessonDetailClient } from "./lesson-detail-client"

type OutputType = 'rpp' | 'slide' | 'soal' | 'lks' | 'rubrik' | 'media' | 'remedial' | 'enrichment'

interface LessonOutput {
  id: string
  type: OutputType
  content: any
  version: number
  created_at: string
}

interface Lesson {
  id: string
  subject: string
  grade: string
  topic: string
  curriculum: string | null
  standard: string | null
  created_at: string
  lesson_outputs: LessonOutput[]
}

export default function LessonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const lessonId = params.id as string
  const [activeOutput, setActiveOutput] = useState<OutputType>('rpp')
  const [editMode, setEditMode] = useState(false)
  const [editedContent, setEditedContent] = useState<string>("")

  const { data: lessonData, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const res = await fetch(`/api/lessons/${lessonId}`)
      if (!res.ok) throw new Error("Lesson not found")
      return res.json() as Promise<{ lesson: Lesson }>
    },
    enabled: !!lessonId,
  })

  const lesson = lessonData?.lesson
  const outputs = lesson?.lesson_outputs || []
  const currentOutput = outputs.find((o: LessonOutput) => o.type === activeOutput)

  const generateMutation = useMutation({
    mutationFn: async (type: OutputType) => {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, type }),
      })
      if (!res.ok) throw new Error("Generate failed")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] })
      toast({ title: "Berhasil", description: `${OUTPUT_TYPES.find(t => t.value === activeOutput)?.label} digenerate`, variant: "success" })
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/lessons/${lessonId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
    },
    onSuccess: () => {
      toast({ title: "Dihapus", variant: "success" })
      router.push("/dashboard")
      router.refresh()
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    },
  })

  const handleGenerate = (type: OutputType) => {
    generateMutation.mutate(type)
  }

  const handleExport = (type: 'json' | 'txt' | 'md') => {
    if (!currentOutput) return
    const content = type === 'json' 
      ? JSON.stringify(currentOutput.content, null, 2)
      : type === 'md'
        ? jsonToMarkdown(currentOutput.content)
        : JSON.stringify(currentOutput.content, null, 2)
    
    const blob = new Blob([content], { type: type === 'json' ? 'application/json' : 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${lesson?.topic}-${activeOutput}.${type === 'json' ? 'json' : 'txt'}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopy = () => {
    if (!currentOutput) return
    navigator.clipboard.writeText(JSON.stringify(currentOutput.content, null, 2))
    toast({ title: "Disalin", description: "JSON disalin ke clipboard", variant: "success" })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Lesson tidak ditemukan</p>
            <Button onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <LessonDetailClient
      lesson={lesson}
      activeOutput={activeOutput}
      setActiveOutput={setActiveOutput}
      outputs={outputs}
      currentOutput={currentOutput}
      generateMutation={generateMutation}
      deleteMutation={deleteMutation}
      handleGenerate={handleGenerate}
      handleExport={handleExport}
      handleCopy={handleCopy}
      editMode={editMode}
      setEditMode={setEditMode}
      editedContent={editedContent}
      setEditedContent={setEditedContent}
    />
  )
}

function jsonToMarkdown(obj: any): string {
  let md = ''
  const process = (val: any, prefix = '') => {
    if (Array.isArray(val)) {
      val.forEach((item, i) => process(item, `${prefix}${i + 1}. `))
    } else if (typeof val === 'object' && val !== null) {
      Object.entries(val).forEach(([k, v]) => {
        const newPrefix = prefix ? `${prefix}${k}: ` : `${k}: `
        if (typeof v === 'object') {
          md += `${newPrefix}\n`
          process(v, '  ')
        } else {
          md += `${newPrefix}${v}\n`
        }
      })
    } else {
      md += `${prefix}${val}\n`
    }
  }
  process(obj)
  return md
}