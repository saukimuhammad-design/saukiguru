"use client"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, Loader2, Download, Copy, 
  FileText, Presentation, HelpCircle, 
  Clipboard, CheckSquare, Image, 
  RotateCcw, Star, Sparkles, 
  Edit, Trash2, Eye, MoreHorizontal
} from "lucide-react"
import { OUTPUT_TYPES } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { OutputRenderer } from "./output-renderer"
import { UseMutationResult } from "@tanstack/react-query"

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

interface LessonOutput {
  id: string
  type: OutputType
  content: any
  version: number
  created_at: string
}

type OutputType = 'rpp' | 'slide' | 'soal' | 'lks' | 'rubrik' | 'media' | 'remedial' | 'enrichment'

interface LessonDetailClientProps {
  lesson: Lesson
  activeOutput: OutputType
  setActiveOutput: (v: OutputType) => void
  outputs: LessonOutput[]
  currentOutput: LessonOutput | undefined
  generateMutation: UseMutationResult<any, Error, OutputType, unknown>
  deleteMutation: UseMutationResult<any, Error, void, unknown>
  handleGenerate: (type: OutputType) => void
  handleExport: (type: 'json' | 'txt' | 'md') => void
  handleCopy: () => void
  editMode: boolean
  setEditMode: (v: boolean) => void
  editedContent: string
  setEditedContent: (v: string) => void
}

export function LessonDetailClient({
  lesson,
  activeOutput,
  setActiveOutput,
  outputs,
  currentOutput,
  generateMutation,
  deleteMutation,
  handleGenerate,
  handleExport,
  handleCopy,
  editMode,
  setEditMode,
  editedContent,
  setEditedContent,
}: LessonDetailClientProps) {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-bold text-lg">{lesson.topic}</h1>
              <p className="text-sm text-muted-foreground">
                {lesson.subject} • {lesson.grade} • {lesson.curriculum?.toUpperCase()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-1" />
              Copy JSON
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Tabs value={activeOutput} onValueChange={setActiveOutput} className="w-full">
            <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 gap-1">
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
                const hasOutput = outputs.some(o => o.type === type.value)
                return (
                  <TabsTrigger 
                    key={type.value} 
                    value={type.value} 
                    className="flex flex-col items-center gap-1 px-2 py-3 text-xs"
                  >
                    <Icon className={cn("h-4 w-4", hasOutput && "text-primary")} />
                    <span className="truncate w-full text-center">{type.label.split(' ')[0]}</span>
                    {hasOutput && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>
        </div>

        <Tabs value={activeOutput} onValueChange={setActiveOutput}>
          {OUTPUT_TYPES.map((type) => (
            <TabsContent key={type.value} value={type.value} className="pt-4">
              <OutputRenderer
                lesson={lesson}
                outputType={type.value}
                output={outputs.find(o => o.type === type.value)}
                onGenerate={() => handleGenerate(type.value)}
                isGenerating={generateMutation.isPending}
                editMode={editMode}
                setEditMode={setEditMode}
                editedContent={editedContent}
                setEditedContent={setEditedContent}
              />
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  )
}