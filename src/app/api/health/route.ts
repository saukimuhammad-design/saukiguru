import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // Check database connection
    const supabase = createClient()
    const { error } = await supabase.from('lessons').select('id').limit(1)
    
    if (error) {
      return NextResponse.json(
        { status: 'unhealthy', database: 'disconnected', error: error.message },
        { status: 503 }
      )
    }

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 503 }
    )
  }
}