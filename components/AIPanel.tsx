'use client'

import { useState } from 'react'
import { AIMode, AIResponse, AITask } from '@/types'

interface AIPanelProps {
  isLoading: boolean
  currentTask: AITask | null
  onReview: (instruction?: string) => void
  onRewrite: (instruction?: string) => void
  onContinue: (instruction?: string) => void
  onApplyResult: (result: string) => void
}

export default function AIPanel({
  isLoading,
  currentTask,
  onReview,
  onRewrite,
  onContinue,
  onApplyResult,
}: AIPanelProps) {
  const [instruction, setInstruction] = useState('')
  const [activeMode, setActiveMode] = useState<AIMode | null>(null)

  const handleAction = (mode: AIMode) => {
    setActiveMode(mode)
    const inst = instruction.trim() || undefined
    switch (mode) {
      case 'REVIEW': onReview(inst); break
      case 'REWRITE': onRewrite(inst); break
      case 'CONTINUE': onContinue(inst); break
    }
  }

  const response = currentTask?.response

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          🤖 AI Agent
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Select text or use the full document
        </p>
      </div>

      {/* Instructions Input */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Custom Instruction (optional)
        </label>
        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="e.g., Make it more formal, Fix grammar only..."
          className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 resize-none"
          rows={3}
        />
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => handleAction('REVIEW')}
          disabled={isLoading}
          className="w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white rounded font-medium text-sm transition-colors"
        >
          {isLoading && activeMode === 'REVIEW' ? '⏳ Reviewing...' : '🔍 Review Text'}
        </button>
        <button
          onClick={() => handleAction('REWRITE')}
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded font-medium text-sm transition-colors"
        >
          {isLoading && activeMode === 'REWRITE' ? '⏳ Rewriting...' : '✏️ Rewrite'}
        </button>
        <button
          onClick={() => handleAction('CONTINUE')}
          disabled={isLoading}
          className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded font-medium text-sm transition-colors"
        >
          {isLoading && activeMode === 'CONTINUE' ? '⏳ Continuing...' : '➡️ Continue Writing'}
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-4 flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          <span className="text-sm">AI is processing...</span>
        </div>
      )}

      {/* Results */}
      {!isLoading && response && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-700 dark:text-gray-300">
              Results
            </h3>
            {response.tokensUsed && (
              <span className="text-xs text-gray-400">{response.tokensUsed} tokens</span>
            )}
          </div>

          {/* Review Suggestions */}
          {response.mode === 'REVIEW' && response.suggestions && (
            <div className="space-y-2">
              {response.suggestions.map((suggestion, i) => (
                <div key={i} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm">
                  <div className="font-medium text-yellow-800 dark:text-yellow-200">
                    {suggestion.type === 'replace' ? '↔ Replace' : suggestion.type === 'insert' ? '+ Insert' : '- Delete'}
                  </div>
                  {suggestion.original && (
                    <div className="text-red-600 dark:text-red-400 line-through mt-1">
                      &quot;{suggestion.original}&quot;
                    </div>
                  )}
                  <div className="text-green-600 dark:text-green-400 mt-1">
                    &quot;{suggestion.suggested}&quot;
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                    {suggestion.reason}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Rewrite Result */}
          {response.mode === 'REWRITE' && response.result && (
            <div className="space-y-2">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                <p className="text-sm text-gray-700 dark:text-gray-300">{response.result}</p>
              </div>
              <button
                onClick={() => onApplyResult(response.result)}
                className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
              >
                Apply Rewrite
              </button>
            </div>
          )}

          {/* Continue Result */}
          {response.mode === 'CONTINUE' && response.result && (
            <div className="space-y-2">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                <p className="text-sm text-gray-700 dark:text-gray-300">{response.result}</p>
              </div>
              <button
                onClick={() => onApplyResult(response.result)}
                className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors"
              >
                Append to Document
              </button>
            </div>
          )}

          {/* Failed task */}
          {currentTask?.status === 'failed' && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
              <p className="text-sm text-red-700 dark:text-red-300">{currentTask.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
