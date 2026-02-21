'use client'

import { Editor } from '@tiptap/react'
import { useCallback } from 'react'

interface ToolbarProps {
  editor: Editor | null
}

interface ToolbarButton {
  label: string
  action: () => void
  isActive?: boolean
  disabled?: boolean
  title?: string
}

export default function Toolbar({ editor }: ToolbarProps) {
  const setLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  if (!editor) return null

  const buttons: ToolbarButton[] = [
    {
      label: 'B',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      title: 'Bold (Ctrl+B)',
    },
    {
      label: 'I',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      title: 'Italic (Ctrl+I)',
    },
    {
      label: 'U',
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'),
      title: 'Underline (Ctrl+U)',
    },
    {
      label: 'S',
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike'),
      title: 'Strikethrough',
    },
    {
      label: 'H1',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 }),
      title: 'Heading 1',
    },
    {
      label: 'H2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
      title: 'Heading 2',
    },
    {
      label: 'H3',
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive('heading', { level: 3 }),
      title: 'Heading 3',
    },
    {
      label: '• List',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
      title: 'Bullet List',
    },
    {
      label: '1. List',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
      title: 'Ordered List',
    },
    {
      label: '</>',
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive('code'),
      title: 'Inline Code',
    },
    {
      label: 'Block',
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive('codeBlock'),
      title: 'Code Block',
    },
    {
      label: '❝',
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote'),
      title: 'Blockquote',
    },
    {
      label: '🔗',
      action: setLink,
      isActive: editor.isActive('link'),
      title: 'Add Link',
    },
    {
      label: '🖍',
      action: () => editor.chain().focus().toggleHighlight().run(),
      isActive: editor.isActive('highlight'),
      title: 'Highlight',
    },
    {
      label: '↩',
      action: () => editor.chain().focus().undo().run(),
      disabled: !editor.can().undo(),
      title: 'Undo (Ctrl+Z)',
    },
    {
      label: '↪',
      action: () => editor.chain().focus().redo().run(),
      disabled: !editor.can().redo(),
      title: 'Redo (Ctrl+Y)',
    },
  ]

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
      {buttons.map((btn, index) => (
        <button
          key={index}
          onClick={btn.action}
          disabled={btn.disabled}
          title={btn.title}
          className={`px-2 py-1 text-sm rounded font-mono transition-colors ${
            btn.isActive
              ? 'bg-blue-500 text-white'
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
          } ${btn.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {btn.label}
        </button>
      ))}
    </div>
  )
}
