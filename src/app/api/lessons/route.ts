import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const LessonSchema = z.object({
  subject: z.string().min(1).max(100),
  grade: z.string().min(1).max(50),
  topic: z.string().min(1).max(200),
  curriculum: z.enum(['merdeka', 'ktsp', 'cambridge', 'ib']).default('merdeka'),
  standard: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const subject = searchParams.get('subject')
    const grade = searchParams.get('grade')

    let query = supabase
      .from('lessons')
      .select(`
        *,
        lesson_outputs (id, type, version, created_at)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (subject) query = query.ilike('subject', `%${subject}%`)
    if (grade) query = query.eq('grade', grade)

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({ lessons: data, page, limit, total: count })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch lessons' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data = LessonSchema.parse(body)

    const { data: lesson, error } = await supabase
      .from('lessons')
      .insert({ ...data, user_id: user.id })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ lesson }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create lesson' },
      { status: 500 }
    )
  }
}
