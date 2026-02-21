import { useEditor as useTiptapEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import { useCallback } from 'react'

export function useEditor(placeholder?: string) {
  const editor = useTiptapEditor({
    extensions: [
      StarterKit.configure({
        history: {},
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer',
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing...',
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  })

  const getSelectedText = useCallback((): string => {
    if (!editor) return ''
    const { from, to } = editor.state.selection
    return editor.state.doc.textBetween(from, to, ' ')
  }, [editor])

  const getFullText = useCallback((): string => {
    if (!editor) return ''
    return editor.getText()
  }, [editor])

  const getJSON = useCallback(() => {
    if (!editor) return {}
    return editor.getJSON()
  }, [editor])

  const replaceSelection = useCallback((text: string) => {
    if (!editor) return
    editor.chain().focus().insertContent(text).run()
  }, [editor])

  return {
    editor,
    getSelectedText,
    getFullText,
    getJSON,
    replaceSelection,
  }
}
