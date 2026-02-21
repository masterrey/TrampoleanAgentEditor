import OpenAI from 'openai'
import { AIRequest, AIResponse, AIMode } from '@/types'
import { REVIEW_PROMPT, REWRITE_PROMPT, CONTINUE_PROMPT } from './aiPrompts'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPTS: Record<AIMode, string> = {
  REVIEW: REVIEW_PROMPT,
  REWRITE: REWRITE_PROMPT,
  CONTINUE: CONTINUE_PROMPT,
}

/**
 * Sanitize text input to prevent injection attacks
 */
function sanitizeInput(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .substring(0, 10000) // Limit input length
}

/**
 * Build user message from AI request
 */
function buildUserMessage(request: AIRequest): string {
  const sanitized = {
    text: sanitizeInput(request.fullContext),
    selectedText: request.selectedText ? sanitizeInput(request.selectedText) : undefined,
    userInstruction: request.userInstruction ? sanitizeInput(request.userInstruction) : undefined,
  }
  return JSON.stringify(sanitized)
}

/**
 * Call OpenAI API with the given AI request
 */
export async function callAI(request: AIRequest): Promise<AIResponse> {
  const systemPrompt = SYSTEM_PROMPTS[request.mode]
  const userMessage = buildUserMessage(request)

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('No response from AI')
  }

  const parsed = JSON.parse(content) as AIResponse
  parsed.tokensUsed = response.usage?.total_tokens

  return parsed
}
