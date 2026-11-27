"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { 
  Sparkles, Loader2, Edit, Eye
} from "lucide-react"
import { OUTPUT_TYPES, formatRelativeTime } from "@/lib/utils"
import { RenderedContent } from "./rendered-content"

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

interface OutputRendererProps {
  lesson: Lesson
  outputType: OutputType
  output: LessonOutput | undefined
  onGenerate: () => void
  isGenerating: boolean
  editMode: boolean
  setEditMode: (v: boolean) => void
  editedContent: string
  setEditedContent: (v: string) => void
}

export function OutputRenderer({ 
  lesson, 
  outputType, 
  output, 
  onGenerate, 
  isGenerating,
  editMode,
  setEditMode,
  editedContent,
  setEditedContent,
}: OutputRendererProps) {
  const outputTypeInfo = OUTPUT_TYPES.find(t => t.value === outputType)
  const hasOutput = !!output
  const contentJson = hasOutput ? JSON.stringify(output.content, null, 2) : ''

  return (
    <div>
      {!hasOutput && (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Belum ada {outputTypeInfo?.label}</h3>
            <p className="text-muted-foreground mb-4">
              Klik tombol di bawah untuk generate dengan AI
            </p>
            <Button onClick={onGenerate} disabled={isGenerating} className="w-full sm:w-auto">
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Menghasilkan...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate {outputTypeInfo?.label}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {hasOutput && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                v{output.version} • {formatRelativeTime(output.created_at)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditedContent(contentJson); setEditMode(true)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit JSON
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditMode(false); setEditedContent("")}>
                <Eye className="h-4 w-4 mr-1" />
                Lihat Render
              </Button>
            </div>
          </div>

          {editMode ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Edit JSON
                  <Button variant="ghost" size="sm" onClick={() => {
                    try { JSON.parse(editedContent); setEditMode(false) } catch { alert("JSON tidak valid") }
                  }}>
                    Simpan
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="font-mono text-sm h-[500px]"
                  placeholder="Edit JSON di sini..."
                />
              </CardContent>
            </Card>
          ) : (
            <RenderedContent content={output.content} outputType={outputType} />
          )}
        </div>
      )}
    </div>
  )
}