import { REVIEW_PROMPT, REWRITE_PROMPT, CONTINUE_PROMPT } from '@/services/aiPrompts'

describe('AI Prompt Templates', () => {
  it('REVIEW_PROMPT should contain required elements', () => {
    expect(REVIEW_PROMPT).toContain('professional editor')
    expect(REVIEW_PROMPT).toContain('JSON')
    expect(REVIEW_PROMPT).toContain('suggestions')
  })

  it('REWRITE_PROMPT should contain required elements', () => {
    expect(REWRITE_PROMPT).toContain('rewriting assistant')
    expect(REWRITE_PROMPT).toContain('JSON')
    expect(REWRITE_PROMPT).toContain('rewritten')
  })

  it('CONTINUE_PROMPT should contain required elements', () => {
    expect(CONTINUE_PROMPT).toContain('continuation')
    expect(CONTINUE_PROMPT).toContain('JSON')
    expect(CONTINUE_PROMPT).toContain('continuation')
  })

  it('all prompts should request JSON output', () => {
    expect(REVIEW_PROMPT).toContain('JSON')
    expect(REWRITE_PROMPT).toContain('JSON')
    expect(CONTINUE_PROMPT).toContain('JSON')
  })
})
