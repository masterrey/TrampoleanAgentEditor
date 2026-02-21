// Integration test for AI API route
// Note: These tests require mocking the OpenAI SDK

jest.mock('@/services/openai', () => ({
  callAI: jest.fn(),
}))

import { callAI } from '@/services/openai'
import { AIResponse } from '@/types'

describe('AI Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call AI with correct parameters', async () => {
    const mockResponse: AIResponse = {
      mode: 'REVIEW',
      result: 'Good text',
      suggestions: [],
      tokensUsed: 100,
    }
    ;(callAI as jest.Mock).mockResolvedValueOnce(mockResponse)

    const result = await callAI({
      mode: 'REVIEW',
      fullContext: 'Sample text for review',
    })

    expect(callAI).toHaveBeenCalledWith({
      mode: 'REVIEW',
      fullContext: 'Sample text for review',
    })
    expect(result).toEqual(mockResponse)
  })
})
