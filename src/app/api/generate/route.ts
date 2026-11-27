import { createClient } from '@/lib/supabase/server'
import { openai, MODELS } from '@/lib/openai'
import { PROMPTS, PromptType } from '@/lib/prompts'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const GenerateSchema = z.object({
  lessonId: z.string().uuid(),
  type: z.enum(['rpp', 'slide', 'soal', 'lks', 'rubrik', 'media', 'remedial', 'enrichment']),
  model: z.enum(['fast', 'smart', 'cheap']).default('fast'),
  extraContext: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { lessonId, type, model, extraContext } = GenerateSchema.parse(body)

    // Get lesson data
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .eq('user_id', user.id)
      .single()

    if (lessonError || !lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Get existing RPP if generating other types
    let rppContent: string | null = null
    if (type !== 'rpp') {
      const { data: rppOutput } = await supabase
        .from('lesson_outputs')
        .select('content')
        .eq('lesson_id', lessonId)
        .eq('type', 'rpp')
        .order('version', { ascending: false })
        .limit(1)
        .single()
      
      rppContent = rppOutput ? JSON.stringify(rppOutput.content) : null
    }

    // Build prompt input
    const promptInput = {
      subject: lesson.subject,
      grade: lesson.grade,
      topic: lesson.topic,
      curriculum: lesson.curriculum,
      standard: lesson.standard,
      meeting: 1,
      timeAllocation: 80,
      rppContent,
      extraContext,
    }

    // Generate with OpenAI
    const completion = await openai.chat.completions.create({
      model: MODELS[model],
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: PROMPTS[type] },
        { role: 'user', content: JSON.stringify(promptInput) },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    })

    const content = JSON.parse(completion.choices[0].message.content!)

    // Save output
    const { data: output, error: outputError } = await supabase
      .from('lesson_outputs')
      .insert({
        lesson_id: lessonId,
        type,
        content,
      })
      .select()
      .single()

    if (outputError) throw outputError

    return NextResponse.json({ output, content })
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
