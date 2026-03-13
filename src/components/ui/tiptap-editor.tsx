'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'
import {
    Bold,
    Italic,
    UnderlineIcon,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Heading2,
    Heading3,
    Minus,
} from 'lucide-react'

interface TiptapEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    bgColor?: string
}

const ToolbarButton = ({
    onClick,
    active,
    children,
    title,
}: {
    onClick: () => void
    active?: boolean
    children: React.ReactNode
    title: string
}) => (
    <button
        type="button"
        title={title}
        onMouseDown={(e) => {
            e.preventDefault()
            onClick()
        }}
        className={`p-1.5 rounded transition-all ${active
            ? 'bg-[#BADA55] text-[#00253E]'
            : 'text-[#00253E] hover:bg-[#BADA55]/40'
            }`}
    >
        {children}
    </button>
)

const TiptapEditor = ({
    value,
    onChange,
    placeholder = 'Start typing...',
    bgColor = 'white',
}: TiptapEditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: { HTMLAttributes: { class: 'list-disc pl-5 space-y-1' } },
                orderedList: { HTMLAttributes: { class: 'list-decimal pl-5 space-y-1' } },
                blockquote: { HTMLAttributes: { class: 'border-l-4 border-[#BADA55] pl-4 italic text-gray-500' } },
                heading: { levels: [2, 3] },
            }),
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({
                placeholder,
                emptyEditorClass: 'is-editor-empty',
            }),
        ],
        content: value || '',
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class:
                    'prose prose-sm max-w-none focus:outline-none min-h-[260px] px-4 py-3 text-[#00253E] text-[16px] leading-relaxed',
                spellcheck: 'false',
            },
        },
        immediatelyRender: false,
    })

    // Sync external value changes (e.g. form reset)
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || '')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    if (!editor) return null

    return (
        <div
            className={`rounded-[4px] border border-[#E2E8F0] overflow-hidden bg-white shadow-sm`}
            style={{ backgroundColor: bgColor }}
        >
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-[#E2E8F0] bg-white sticky top-0 z-10">
                <ToolbarButton
                    title="Bold"
                    active={editor.isActive('bold')}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    <Bold className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                    title="Italic"
                    active={editor.isActive('italic')}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <Italic className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                    title="Underline"
                    active={editor.isActive('underline')}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                >
                    <UnderlineIcon className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px h-5 bg-[#E2E8F0] mx-1" />

                <ToolbarButton
                    title="Heading 2"
                    active={editor.isActive('heading', { level: 2 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                    <Heading2 className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                    title="Heading 3"
                    active={editor.isActive('heading', { level: 3 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                >
                    <Heading3 className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px h-5 bg-[#E2E8F0] mx-1" />

                <ToolbarButton
                    title="Bullet List"
                    active={editor.isActive('bulletList')}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    <List className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                    title="Ordered List"
                    active={editor.isActive('orderedList')}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    <ListOrdered className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px h-5 bg-[#E2E8F0] mx-1" />

                <ToolbarButton
                    title="Align Left"
                    active={editor.isActive({ textAlign: 'left' })}
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                >
                    <AlignLeft className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                    title="Align Center"
                    active={editor.isActive({ textAlign: 'center' })}
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                >
                    <AlignCenter className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                    title="Align Right"
                    active={editor.isActive({ textAlign: 'right' })}
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                >
                    <AlignRight className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px h-5 bg-[#E2E8F0] mx-1" />

                <ToolbarButton
                    title="Horizontal Rule"
                    active={false}
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                >
                    <Minus className="w-4 h-4" />
                </ToolbarButton>
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} />

            <style>{`
        .tiptap p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .tiptap h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; color: #00253E; }
        .tiptap h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.4rem; color: #00253E; }
        .tiptap p { margin-bottom: 0.5rem; }
        .tiptap ul, .tiptap ol { margin-bottom: 0.5rem; }
        .tiptap blockquote { margin: 0.5rem 0; }
        .tiptap hr { border-color: #E2E8F0; margin: 0.75rem 0; }
        .tiptap strong { font-weight: 700; }
      `}</style>
        </div>
    )
}

export default TiptapEditor
