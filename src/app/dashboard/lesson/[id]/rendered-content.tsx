"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  FileText, Presentation, HelpCircle, 
  Clipboard, CheckSquare, Image, 
  RotateCcw, Star, Sparkles, 
  Edit, Trash2, Eye, MoreHorizontal,
  Loader2, Download, Copy, ArrowLeft
} from "lucide-react"
import { OUTPUT_TYPES, formatRelativeTime } from "@/lib/utils"
import { cn } from "@/lib/utils"

type OutputType = 'rpp' | 'slide' | 'soal' | 'lks' | 'rubrik' | 'media' | 'remedial' | 'enrichment'

export function RenderedContent({ content, outputType }: { content: any; outputType: OutputType }) {
  if (!content) return <div className="text-muted-foreground">Kosong</div>

  switch (outputType) {
    case 'rpp':
      return <RPPRenderer content={content} />
    case 'slide':
      return <SlideRenderer content={content} />
    case 'soal':
      return <SoalRenderer content={content} />
    case 'lks':
      return <LKSRenderer content={content} />
    case 'rubrik':
      return <RubrikRenderer content={content} />
    case 'media':
      return <MediaRenderer content={content} />
    case 'remedial':
      return <RemedialRenderer content={content} />
    case 'enrichment':
      return <EnrichmentRenderer content={content} />
    default:
      return <pre className="bg-muted p-4 rounded overflow-x-auto text-sm">{JSON.stringify(content, null, 2)}</pre>
  }
}

function RPPRenderer({ content }: { content: any }) {
  return (
    <div className="space-y-6">
      {content.identity && (
        <Card>
          <CardHeader><CardTitle>Identitas</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(content.identity).map(([k, v]) => (
              <div key={k} className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground capitalize">{k}</span>
                <span className="font-medium">{String(v)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {content.cp && (
        <Card>
          <CardHeader><CardTitle>Capaian Pembelajaran (CP)</CardTitle></CardHeader>
          <CardContent><p className="whitespace-pre-wrap">{content.cp}</p></CardContent>
        </Card>
      )}

      {content.tp && content.tp.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Tujuan Pembelajaran (TP)</CardTitle></CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-1">
              {content.tp.map((tp: string, i: number) => (
                <li key={i} className="whitespace-pre-wrap">{tp}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {content.material && content.material.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Materi Pembelajaran</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {content.material.map((m: any, i: number) => (
                <div key={i} className="border-l-2 border-primary pl-4">
                  <h4 className="font-medium">{m.title || `Materi ${i + 1}`}</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{m.content}</p>
                  {m.resources && m.resources.length > 0 && (
                    <ul className="list-disc list-inside text-sm mt-2">
                      {m.resources.map((r: string, j: number) => (
                        <li key={j}><a href={r} target="_blank" rel="noopener" className="text-primary underline">{r}</a></li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {content.method && (
        <Card>
          <CardHeader><CardTitle>Model & Metode Pembelajaran</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {content.method.model && <div><span className="text-muted-foreground">Model: </span><span className="font-medium">{content.method.model}</span></div>}
            {content.method.approach && <div><span className="text-muted-foreground">Pendekatan: </span><span className="font-medium">{content.method.approach}</span></div>}
            {content.method.methods && content.method.methods.length > 0 && (
              <div>
                <span className="text-muted-foreground">Metode: </span>
                <ul className="list-disc list-inside mt-1">
                  {content.method.methods.map((m: string, i: number) => <li key={i}>{m}</li>)}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {content.steps && content.steps.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Langkah-Langkah Pembelajaran</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {content.steps.map((step: any, i: number) => (
                <div key={i} className="border-l-2 border-primary pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium capitalize">{step.phase}</h4>
                    <span className="text-sm text-muted-foreground">{step.totalTime} menit</span>
                  </div>
                  <div className="space-y-2">
                    {step.activities?.map((act: any, j: number) => (
                      <div key={j} className="grid grid-cols-12 gap-2 text-sm">
                        <div className="col-span-2 font-medium text-muted-foreground">{act.teacher ? 'Guru' : 'Siswa'}</div>
                        <div className="col-span-9 whitespace-pre-wrap">{act.teacher || act.student}</div>
                        <div className="col-span-1 text-right text-muted-foreground">{act.time} min</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {content.assessment && (
        <Card>
          <CardHeader><CardTitle>Penilaian</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {content.assessment.technique && <div><span className="text-muted-foreground">Teknik: </span>{content.assessment.technique}</div>}
            {content.assessment.form && <div><span className="text-muted-foreground">Bentuk: </span>{content.assessment.form}</div>}
            {content.assessment.instrument && <div><span className="text-muted-foreground">Instrumen: </span>{content.assessment.instrument}</div>}
            {content.assessment.rubric && content.assessment.rubric.length > 0 && (
              <div className="mt-2">
                <h5 className="font-medium mb-2">Rubrik:</h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border p-2">Kriteria</th>
                        <th className="border p-2">Skor</th>
                        <th className="border p-2">Deskriptor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {content.assessment.rubric.map((r: any, i: number) => (
                        <tr key={i}>
                          <td className="border p-2">{r.criteria}</td>
                          <td className="border p-2 text-center">{r.score}</td>
                          <td className="border p-2">{r.descriptor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function SlideRenderer({ content }: { content: any }) {
  return (
    <div className="space-y-4">
      {content.slides && content.slides.length > 0 && (
        <div className="space-y-4">
          {content.slides.map((slide: any, i: number) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Slide {slide.number}: {slide.title}</CardTitle>
                  <span className="text-xs text-muted-foreground">{slide.duration} min • {slide.type}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="prose prose-sm max-w-none">{slide.content}</div>
                {slide.visual && <p className="text-sm text-muted-foreground"><strong>Visual:</strong> {slide.visual}</p>}
                {slide.notes && <p className="text-sm text-primary"><strong>Catatan Guru:</strong> {slide.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function SoalRenderer({ content }: { content: any }) {
  return (
    <div className="space-y-4">
      {content.questions && content.questions.length > 0 && (
        <div className="space-y-4">
          {content.questions.map((q: any, i: number) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-lg">Soal {i + 1}</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-800">{q.type}</span>
                    <span className="px-2 py-0.5 text-xs rounded bg-green-100 text-green-800">{q.difficulty}</span>
                    <span className="px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-800">{q.bloomLevel}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-medium">{q.question}</p>
                {q.options && q.options.length > 0 && (
                  <ol className="list-lower-alpha list-inside space-y-1 ml-4">
                    {q.options.map((opt: string, j: number) => (
                      <li key={j} className={q.correctAnswer === String.fromCharCode(65+j) ? 'font-medium text-green-600' : ''}>
                        {opt} {q.correctAnswer === String.fromCharCode(65+j) && '✓'}
                      </li>
                    ))}
                  </ol>
                )}
                {q.explanation && <p className="text-sm text-muted-foreground"><strong>Pembahasan:</strong> {q.explanation}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function LKSRenderer({ content }: { content: any }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>{content.title}</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{content.instructions}</p>
          {content.sections && content.sections.map((section: any, i: number) => (
            <div key={i} className="mb-6 p-4 border rounded">
              <h4 className="font-medium mb-2">{section.title} ({section.type})</h4>
              <div className="prose prose-sm mb-4">{section.content}</div>
              {section.questions && section.questions.map((q: any, j: number) => (
                <div key={j} className="mb-3">
                  <p className="font-medium">{q.number}. {q.question}</p>
                  <div className="border-b-2 border-dashed mt-4 mb-2 h-16" />
                  {q.answerKey && <p className="text-sm text-green-600"><strong>Kunci:</strong> {q.answerKey}</p>}
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function RubrikRenderer({ content }: { content: any }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>{content.title}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {content.dimensions && content.dimensions.map((dim: any, i: number) => (
            <div key={i} className="border rounded overflow-hidden">
              <div className="bg-muted p-3 font-medium">{dim.name} (Bobot: {dim.weight}%)</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border p-2">Skor</th>
                      <th className="border p-2">Label</th>
                      <th className="border p-2">Deskriptor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dim.levels.map((level: any, j: number) => (
                      <tr key={j}>
                        <td className="border p-2 text-center font-medium">{level.score}</td>
                        <td className="border p-2">{level.label}</td>
                        <td className="border p-2">{level.descriptor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function MediaRenderer({ content }: { content: any }) {
  return (
    <div className="space-y-4">
      {content.suggestions && content.suggestions.map((media: any, i: number) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{media.title}</CardTitle>
              <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">{media.type}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground">{media.description}</p>
            <div className="flex flex-wrap gap-2">
              {media.tools.map((tool: string, j: number) => (
                <span key={j} className="px-2 py-0.5 text-xs rounded bg-muted">{tool}</span>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div><span className="text-muted-foreground">Waktu: </span>{media.estimatedTime} menit</div>
              <div><span className="text-muted-foreground">Kesulitan: </span>{media.difficulty}</div>
              <div><span className="text-muted-foreground">Biaya: </span>{media.cost}</div>
            </div>
            <ol className="list-decimal list-inside space-y-1">
              {media.steps.map((step: string, j: number) => (
                <li key={j} className="text-sm">{step}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function RemedialRenderer({ content }: { content: any }) {
  return (
    <div className="space-y-4">
      {content.program && (
        <Card>
          <CardHeader><CardTitle>{content.program.title}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Tujuan:</h4>
              <ul className="list-disc list-inset space-y-1">
                {content.program.objectives.map((o: string, i: number) => <li key={i}>{o}</li>)}
              </ul>
            </div>
            <div><h4 className="font-medium mb-2">Target Siswa: {content.program.targetStudents}</h4></div>
            <div><h4 className="font-medium mb-2">Durasi: {content.program.duration} menit</h4></div>
            {content.program.sessions && content.program.sessions.map((session: any, i: number) => (
              <div key={i} className="border-l-2 border-primary pl-4">
                <h5 className="font-medium">Sesi {session.session}: {session.focus}</h5>
                <ul className="list-disc list-inset space-y-1 mt-2">
                  {session.activities.map((a: string, j: number) => <li key={j}>{a}</li>)}
                </ul>
                <p className="text-sm text-muted-foreground mt-1"><strong>Materi:</strong> {session.materials.join(', ')}</p>
                <p className="text-muted-foreground"><strong>Penilaian:</strong> {session.assessment}</p>
              </div>
            ))}
            <div>
              <h4 className="font-medium mb-2">Kriteria Sukses:</h4>
              <ul className="list-disc list-inset space-y-1">
                {content.program.successCriteria.map((c: string, i: number) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function EnrichmentRenderer({ content }: { content: any }) {
  return (
    <div className="space-y-4">
      {content.program && (
        <Card>
          <CardHeader><CardTitle>{content.program.title}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Tujuan:</h4>
              <ul className="list-disc list-inset space-y-1">
                {content.program.objectives.map((o: string, i: number) => <li key={i}>{o}</li>)}
              </ul>
            </div>
            <div><h4 className="font-medium mb-2">Target Siswa: {content.program.targetStudents}</h4></div>
            <div><h4 className="font-medium mb-2">Durasi: {content.program.duration} menit</h4></div>
            {content.program.activities && content.program.activities.map((act: any, i: number) => (
              <div key={i} className="border-l-2 border-green-500 pl-4">
                <h5 className="font-medium">{act.title} ({act.type})</h5>
                <p className="text-sm text-muted-foreground mt-1">{act.description}</p>
                <p className="text-sm text-muted-foreground mt-1"><strong>Produk:</strong> {act.product}</p>
                {act.resources && act.resources.length > 0 && (
                  <ul className="list-disc list-inset text-sm mt-1">
                    {act.resources.map((r: string, j: number) => <li key={j}>{r}</li>)}
                  </ul>
                )}
              </div>
            ))}
            <div><h4 className="font-medium mb-2">Penilaian: {content.program.assessment}</h4></div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}