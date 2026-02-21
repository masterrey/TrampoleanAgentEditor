import { renderHook, act } from '@testing-library/react'
import { useAI } from '@/hooks/useAI'

// Mock fetch
global.fetch = jest.fn()

describe('useAI hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useAI())
    expect(result.current.tasks).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.currentTask).toBeNull()
  })

  it('should process AI request successfully', async () => {
    const mockResponse = {
      mode: 'REVIEW',
      result: 'Text looks good',
      suggestions: [],
      tokensUsed: 50,
    }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useAI())

    await act(async () => {
      await result.current.processAI({
        mode: 'REVIEW',
        fullContext: 'Test text',
      })
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0].status).toBe('completed')
    expect(result.current.tasks[0].response).toEqual(mockResponse)
  })

  it('should handle AI request failure', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'AI service error' }),
    })

    const { result } = renderHook(() => useAI())

    await act(async () => {
      await result.current.processAI({
        mode: 'REVIEW',
        fullContext: 'Test text',
      })
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.tasks[0].status).toBe('failed')
    expect(result.current.tasks[0].error).toBe('AI service error')
  })

  it('should clear tasks', () => {
    const { result } = renderHook(() => useAI())

    act(() => {
      result.current.clearTasks()
    })

    expect(result.current.tasks).toEqual([])
    expect(result.current.currentTask).toBeNull()
  })
})
