import { NextRequest, NextResponse } from 'next/server'
import { callAI } from '@/services/openai'
import { AIRequest, AIMode } from '@/types'

// Rate limiting: simple in-memory store (use Redis in production)
const rateLimit = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxRequests = 20

  const record = rateLimit.get(ip)
  if (!record || now > record.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before trying again.' },
        { status: 429 }
      )
    }

    // Validate API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('[AI API] OPENAI_API_KEY is not configured')
      return NextResponse.json(
        { error: 'AI service is not configured' },
        { status: 503 }
      )
    }

    const body = await request.json() as Partial<AIRequest>

    // Validate request
    const validModes: AIMode[] = ['REVIEW', 'REWRITE', 'CONTINUE']
    if (!body.mode || !validModes.includes(body.mode)) {
      return NextResponse.json(
        { error: `Invalid mode. Must be one of: ${validModes.join(', ')}` },
        { status: 400 }
      )
    }

    if (!body.fullContext || typeof body.fullContext !== 'string') {
      return NextResponse.json(
        { error: 'fullContext is required and must be a string' },
        { status: 400 }
      )
    }

    const aiRequest: AIRequest = {
      mode: body.mode,
      fullContext: body.fullContext,
      selectedText: body.selectedText,
      userInstruction: body.userInstruction,
    }

    console.info(`[AI API] Processing ${body.mode} request, context length: ${body.fullContext.length}`)

    const result = await callAI(aiRequest)

    console.info(`[AI API] Completed ${body.mode} request, tokens used: ${result.tokensUsed}`)

    return NextResponse.json(result)
  } catch (error) {
    console.error('[AI API] Error:', error)

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    )
  }
}
