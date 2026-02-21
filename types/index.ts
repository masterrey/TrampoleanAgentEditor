export interface Document {
  _id?: string
  title: string
  body: Record<string, unknown>
  versions: DocumentVersion[]
  createdAt: Date
  updatedAt: Date
}

export interface DocumentVersion {
  id: string
  body: Record<string, unknown>
  savedAt: Date
  description?: string
}

export type AIMode = 'REVIEW' | 'REWRITE' | 'CONTINUE'

export interface AIRequest {
  mode: AIMode
  selectedText?: string
  fullContext: string
  userInstruction?: string
}

export interface AIResponse {
  mode: AIMode
  result: string
  suggestions?: AISuggestion[]
  tokensUsed?: number
}

export interface AISuggestion {
  type: 'replace' | 'insert' | 'delete'
  original?: string
  suggested: string
  reason: string
}

export interface AITask {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  mode: AIMode
  request: AIRequest
  response?: AIResponse
  error?: string
  createdAt: Date
  completedAt?: Date
}

export interface ToolbarAction {
  label: string
  icon?: string
  action: () => void
  isActive?: boolean
  disabled?: boolean
}
