'use client'

import { useState, useCallback, useEffect } from 'react'
import { EditorContent } from '@tiptap/react'
import { useEditor } from '@/hooks/useEditor'
import { useAI } from '@/hooks/useAI'
import { useAutoSave } from '@/hooks/useAutoSave'
import Toolbar from './Toolbar'
import AIPanel from './AIPanel'
import VersionHistory from './VersionHistory'
import { Document, DocumentVersion } from '@/types'
import toast from 'react-hot-toast'

export default function EditorPage() {
  const [document, setDocument] = useState<Partial<Document>>({
    title: 'Untitled Document',
    body: {},
    versions: [],
  })
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [wordCount, setWordCount] = useState(0)

  const { editor, getSelectedText, getFullText, getJSON, replaceSelection } = useEditor(
    'Start writing your document here...'
  )

  const { tasks, isLoading, currentTask, processAI } = useAI()

  // Update word count when editor changes
  useEffect(() => {
    if (!editor) return
    const updateWordCount = () => {
      const text = editor.getText()
      const words = text.trim().split(/\s+/).filter(Boolean).length
      setWordCount(words)
    }
    editor.on('update', updateWordCount)
    return () => {
      editor.off('update', updateWordCount)
    }
  }, [editor])

  // Auto-save handler
  const handleAutoSave = useCallback(
    async (data: unknown) => {
      const json = data as Record<string, unknown>
      // In real app: await fetch('/api/documents/id', { method: 'PUT', body: JSON.stringify(json) })
      console.info('[AutoSave] Document saved', json)
      toast.success('Document auto-saved', { duration: 1500, icon: '💾' })
    },
    []
  )

  const editorJSON = editor ? getJSON() : {}

  useAutoSave({
    data: { title: document.title, body: editorJSON },
    onSave: handleAutoSave,
    delay: 5000,
    enabled: !!editor && editor.getText().length > 0,
  })

  const handleReview = useCallback(
    async (instruction?: string) => {
      const selected = getSelectedText()
      const full = getFullText()
      if (!full.trim()) {
        toast.error('Please write some text first')
        return
      }
      await processAI({
        mode: 'REVIEW',
        selectedText: selected || undefined,
        fullContext: full,
        userInstruction: instruction,
      })
    },
    [getSelectedText, getFullText, processAI]
  )

  const handleRewrite = useCallback(
    async (instruction?: string) => {
      const selected = getSelectedText()
      const full = getFullText()
      if (!selected && !full.trim()) {
        toast.error('Please select text or write some content first')
        return
      }
      await processAI({
        mode: 'REWRITE',
        selectedText: selected || undefined,
        fullContext: full,
        userInstruction: instruction,
      })
    },
    [getSelectedText, getFullText, processAI]
  )

  const handleContinue = useCallback(
    async (instruction?: string) => {
      const full = getFullText()
      if (!full.trim()) {
        toast.error('Please write some text to continue from')
        return
      }
      await processAI({
        mode: 'CONTINUE',
        fullContext: full,
        userInstruction: instruction,
      })
    },
    [getFullText, processAI]
  )

  const handleApplyResult = useCallback(
    (result: string) => {
      if (!editor) return
      if (currentTask?.mode === 'CONTINUE') {
        editor.chain().focus().insertContentAt(editor.state.doc.content.size, '\n' + result).run()
        toast.success('Continuation appended!')
      } else {
        replaceSelection(result)
        toast.success('Text applied!')
      }
    },
    [editor, currentTask, replaceSelection]
  )

  const handleRestoreVersion = useCallback(
    (version: DocumentVersion) => {
      if (!editor) return
      editor.commands.setContent(version.body as Parameters<typeof editor.commands.setContent>[0])
      toast.success('Version restored!')
      setShowVersionHistory(false)
    },
    [editor]
  )

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
            ✍️ TrampoleanAgentEditor
          </span>
          <input
            type="text"
            value={document.title}
            onChange={(e) => setDocument((prev) => ({ ...prev, title: e.target.value }))}
            className="text-gray-600 dark:text-gray-300 bg-transparent border-none outline-none text-sm"
            placeholder="Document title..."
          />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400">
            {wordCount} words
          </span>
          <button
            onClick={() => setShowVersionHistory(true)}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded transition-colors"
          >
            📜 History ({document.versions?.length || 0})
          </button>
          <span className="text-xs text-gray-400">
            {tasks.filter((t) => t.status === 'completed').length} AI tasks
          </span>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Toolbar editor={editor} />
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto">
              <EditorContent
                editor={editor}
                className="min-h-[500px] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>

        {/* AI Panel */}
        <AIPanel
          isLoading={isLoading}
          currentTask={currentTask}
          onReview={handleReview}
          onRewrite={handleRewrite}
          onContinue={handleContinue}
          onApplyResult={handleApplyResult}
        />
      </div>

      {/* Version History Modal */}
      {showVersionHistory && (
        <VersionHistory
          versions={document.versions || []}
          onRestore={handleRestoreVersion}
          onClose={() => setShowVersionHistory(false)}
        />
      )}
    </div>
  )
}
