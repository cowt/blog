"use client"

import { Editor } from "@tiptap/react"
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  ChevronsDownUp,
  Table,
  ListTodo,
  CodeSquare,
  Plus,
  Sigma,
  GitBranch,
  Minus,
  Superscript,
  Subscript,
  Smile,
  Footprints,
  IndentIncrease,
  IndentDecrease,
} from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useCallback, useState, useEffect } from "react"
import { KeyboardShortcutsHelp } from "./keyboard-shortcuts-help"

// 常用 emoji 分类
const emojiCategories = {
  "😀 表情": ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😋", "😛", "🤔", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "😮‍💨", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "🥸", "😎", "🤓", "🧐"],
  "👋 手势": ["👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏"],
  "❤️ 心形": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "💕", "💞", "💓", "💗", "💖", "💘", "💝"],
  "🎉 庆祝": ["🎉", "🎊", "🎈", "🎁", "🎀", "🏆", "🥇", "🥈", "🥉", "🏅", "🎖️", "🎗️", "✨", "🌟", "⭐", "💫", "🔥", "💥", "💯"],
  "📝 符号": ["✅", "❌", "⭕", "❗", "❓", "💡", "📌", "📍", "🔖", "📎", "🔗", "📝", "✏️", "📚", "📖", "🔍", "🔎", "⚠️", "🚫", "♻️"],
  "🍕 食物": ["🍕", "🍔", "🍟", "🌭", "🍿", "🧂", "🥓", "🥚", "🍳", "🧇", "🥞", "🧈", "🍞", "🥐", "🥖", "🥨", "🧀", "🥗", "🥙", "🌮", "🌯", "🫔", "🥫", "🍝", "🍜", "🍲", "🍛", "🍣", "🍱", "🥟", "🦪", "🍤", "🍙", "🍚", "🍘", "🍥", "🥠", "🥮", "🍢", "🍡", "🍧", "🍨", "🍦", "🥧", "🧁", "🍰", "🎂", "🍮", "🍭", "🍬", "🍫", "🍩", "🍪", "🌰", "🥜", "🍯", "🥛", "🍼", "☕", "🍵", "🧃", "🥤", "🧋", "🍶", "🍺", "🍻", "🥂", "🍷", "🥃", "🍸", "🍹", "🧉", "🍾"],
  "🐱 动物": ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐜", "🦟", "🦗", "🕷️", "🦂", "🐢", "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🦧", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒", "🦘", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🦙", "🐐", "🦌", "🐕", "🐩", "🦮", "🐕‍🦺", "🐈", "🐈‍⬛", "🐓", "🦃", "🦚", "🦜", "🦢", "🦩", "🕊️", "🐇", "🦝", "🦨", "🦡", "🦦", "🦥", "🐁", "🐀", "🐿️", "🦔"],
  "🌸 自然": ["🌸", "💮", "🏵️", "🌹", "🥀", "🌺", "🌻", "🌼", "🌷", "🌱", "🌲", "🌳", "🌴", "🌵", "🌾", "🌿", "☘️", "🍀", "🍁", "🍂", "🍃", "🍄", "🌍", "🌎", "🌏", "🌐", "🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘", "🌙", "🌚", "🌛", "🌜", "☀️", "🌝", "🌞", "🌠", "☁️", "⛅", "⛈️", "🌤️", "🌥️", "🌦️", "🌧️", "🌨️", "🌩️", "🌪️", "🌫️", "🌬️", "🌀", "🌈", "🌂", "☂️", "☔", "⛱️", "⚡", "❄️", "☃️", "⛄", "☄️", "💧", "🌊"],
} as const

interface ToolbarProps {
  editor: Editor | null
}

export function Toolbar({ editor }: ToolbarProps) {
  // State to track if user is typing
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimer, setTypingTimer] = useState<NodeJS.Timeout | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Emoji 选择器状态
  const [emojiOpen, setEmojiOpen] = useState(false)

  if (!editor) {
    return null
  }

  // Handle typing detection
  useEffect(() => {
    if (!editor) return

    const handleUpdate = () => {
      setIsTyping(true)
      
      // Clear existing timer
      if (typingTimer) {
        clearTimeout(typingTimer)
      }
      
      // Set new timer to hide toolbar after 2 seconds of inactivity
      const newTimer = setTimeout(() => {
        setIsTyping(false)
      }, 2000)
      
      setTypingTimer(newTimer)
    }

    const handleSelectionUpdate = () => {
      // Don't hide toolbar when just selecting text
      if (typingTimer) {
        clearTimeout(typingTimer)
      }
      setIsTyping(false)
    }

    editor.on('update', handleUpdate)
    editor.on('selectionUpdate', handleSelectionUpdate)

    return () => {
      editor.off('update', handleUpdate)
      editor.off('selectionUpdate', handleSelectionUpdate)
      if (typingTimer) {
        clearTimeout(typingTimer)
      }
    }
  }, [editor, typingTimer])

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("URL", previousUrl)

    if (url === null) {
      return
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }, [editor])

  // 插入表格
  const insertTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }, [editor])

  // 插入任务列表
  const insertTaskList = useCallback(() => {
    editor.chain().focus().toggleTaskList().run()
  }, [editor])

  // 插入代码块
  const insertCodeBlock = useCallback(() => {
    editor.chain().focus().toggleCodeBlock().run()
  }, [editor])

  // 插入数学公式块
  const insertMathBlock = useCallback(() => {
    ; (editor.commands as any).setMathBlock()
  }, [editor])

  // 插入行内数学公式
  const insertMathInline = useCallback(() => {
    ; (editor.commands as any).setMathInline()
  }, [editor])

  // 插入 Mermaid 图表
  const insertMermaid = useCallback(() => {
    ; (editor.commands as any).setMermaid()
  }, [editor])

  // 插入水平分割线
  const insertHorizontalRule = useCallback(() => {
    editor.chain().focus().setHorizontalRule().run()
  }, [editor])

  // 插入脚注
  const insertFootnote = useCallback(() => {
    const content = window.prompt("脚注内容", "")
    if (!content) return

    // 计算脚注编号 - 基于脚注列表中的项数
    const doc = editor.state.doc
    let footnoteItemCount = 0
    doc.descendants((node) => {
      if (node.type.name === "footnoteItem") footnoteItemCount++
      return true
    })
    const label = footnoteItemCount + 1
    const id = `fn-${label}-${Date.now()}`

    // 在当前位置插入脚注引用节点
    editor.chain().focus().insertContent({
      type: "footnoteRef",
      attrs: { id, label },
    }).run()
    
    // 查找或创建脚注列表
    let hasFootnoteList = false
    doc.descendants((node) => {
      if (node.type.name === "footnoteList") hasFootnoteList = true
      return true
    })

    if (hasFootnoteList) {
      // 在现有脚注列表中添加新项
      editor.chain()
        .command(({ tr, state }) => {
          let footnoteListPos = -1
          state.doc.descendants((node, pos) => {
            if (node.type.name === "footnoteList") {
              footnoteListPos = pos + node.nodeSize - 1
            }
            return true
          })
          if (footnoteListPos > 0) {
            const footnoteItem = state.schema.nodes.footnoteItem.create(
              { id },
              state.schema.text(content)
            )
            tr.insert(footnoteListPos, footnoteItem)
          }
          return true
        })
        .run()
    } else {
      // 在文档末尾创建脚注列表
      editor.chain()
        .command(({ tr, state }) => {
          const endPos = state.doc.content.size
          const footnoteItem = state.schema.nodes.footnoteItem.create(
            { id },
            state.schema.text(content)
          )
          const footnoteList = state.schema.nodes.footnoteList.create(null, footnoteItem)
          tr.insert(endPos, footnoteList)
          return true
        })
        .run()
    }
  }, [editor])

  // 插入 emoji
  const insertEmoji = useCallback((emoji: string) => {
    editor.chain().focus().insertContent(emoji).run()
    setEmojiOpen(false)
  }, [editor])

  return (
    <div 
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 rounded-full border bg-background/90 backdrop-blur shadow-lg transition-all hover:bg-background max-w-[95vw] sm:max-w-none overflow-x-auto scrollbar-hide ${
        isTyping && !isHovered ? 'opacity-0 pointer-events-none translate-y-2' : 'opacity-100 pointer-events-auto translate-y-0'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 文本格式 */}
      <Toggle
        size="sm"
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        aria-label="Toggle bold"
        className="rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0"
      >
        <Bold className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        aria-label="Toggle italic"
        className="rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0"
      >
        <Italic className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("strike")}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        aria-label="Toggle strikethrough"
        className="rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0"
      >
        <Strikethrough className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("code")}
        onPressedChange={() => editor.chain().focus().toggleCode().run()}
        aria-label="Toggle code"
        className="rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0"
      >
        <Code className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-5 sm:h-6 mx-0.5 sm:mx-1 hidden sm:block" />

      {/* 标题 */}
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 1 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        aria-label="Toggle heading 1"
        className="rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0"
      >
        <Heading1 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 2 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        aria-label="Toggle heading 2"
        className="rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0"
      >
        <Heading2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-5 sm:h-6 mx-0.5 sm:mx-1 hidden sm:block" />

      {/* 列表 */}
      <Toggle
        size="sm"
        pressed={editor.isActive("bulletList")}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        aria-label="Toggle bullet list"
        className="rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0"
      >
        <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("orderedList")}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        aria-label="Toggle ordered list"
        className="rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0"
      >
        <ListOrdered className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("taskList")}
        onPressedChange={insertTaskList}
        aria-label="Toggle task list"
        className="rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0"
      >
        <ListTodo className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-5 sm:h-6 mx-0.5 sm:mx-1 hidden sm:block" />

      {/* 通用缩进控制 - 支持列表和普通文本 */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.commands.increaseIndent()}
        aria-label="Increase indent"
        className="rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0"
      >
        <IndentIncrease className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => editor.commands.decreaseIndent()}
        aria-label="Decrease indent"
        className="rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0"
      >
        <IndentDecrease className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Button>

      <Separator orientation="vertical" className="h-5 sm:h-6 mx-0.5 sm:mx-1 hidden sm:block" />

      {/* 引用和折叠 */}
      <Toggle
        size="sm"
        pressed={editor.isActive("blockquote")}
        onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
        aria-label="Toggle blockquote"
        className="rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0"
      >
        <Quote className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Toggle>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => (editor.commands as any).setDetails()}
        aria-label="Insert details"
        className={`rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0 ${editor.isActive("details") ? "bg-muted" : ""}`}
      >
        <ChevronsDownUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Button>

      {/* 表格按钮 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={insertTable}
        aria-label="Insert table"
        className={`rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0 ${editor.isActive("table") ? "bg-muted" : ""}`}
      >
        <Table className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Button>

      <Separator orientation="vertical" className="h-5 sm:h-6 mx-0.5 sm:mx-1 hidden sm:block" />

      {/* 链接、图片和 Emoji */}
      <Button
        variant="ghost"
        size="sm"
        onClick={setLink}
        className={`rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0 ${editor.isActive("link") ? "bg-muted" : ""}`}
        aria-label="Set link"
      >
        <LinkIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.commands.openImageUpload()}
        aria-label="Upload image"
        className="rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0"
      >
        <ImageIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Button>

      {/* Emoji 选择器 */}
      <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Insert emoji"
            className="rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0"
          >
            <Smile className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-2" align="center" side="top">
          <div className="max-h-64 overflow-y-auto">
            {Object.entries(emojiCategories).map(([category, emojis]) => (
              <div key={category} className="mb-2">
                <div className="text-xs text-muted-foreground mb-1 sticky top-0 bg-popover py-1">{category}</div>
                <div className="grid grid-cols-8 gap-1">
                  {emojis.map((emoji, index) => (
                    <button
                      key={`${category}-${index}`}
                      onClick={() => insertEmoji(emoji)}
                      className="w-8 h-8 flex items-center justify-center text-lg hover:bg-muted rounded transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="h-5 sm:h-6 mx-0.5 sm:mx-1 hidden sm:block" />

      {/* 更多插入选项 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            aria-label="More insert options"
            className="rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-48">
          <DropdownMenuLabel className="text-xs text-muted-foreground">代码与公式</DropdownMenuLabel>
          <DropdownMenuItem onClick={insertCodeBlock}>
            <CodeSquare className="h-4 w-4 mr-2" />
            代码块
          </DropdownMenuItem>
          <DropdownMenuItem onClick={insertMathInline}>
            <Sigma className="h-4 w-4 mr-2" />
            行内公式
          </DropdownMenuItem>
          <DropdownMenuItem onClick={insertMathBlock}>
            <Sigma className="h-4 w-4 mr-2" />
            公式块
          </DropdownMenuItem>
          <DropdownMenuItem onClick={insertMermaid}>
            <GitBranch className="h-4 w-4 mr-2" />
            Mermaid 图表
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">文本格式</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
            <Heading3 className="h-4 w-4 mr-2" />
            三级标题
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().toggleSuperscript().run()}>
            <Superscript className="h-4 w-4 mr-2" />
            上标
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().toggleSubscript().run()}>
            <Subscript className="h-4 w-4 mr-2" />
            下标
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">其他</DropdownMenuLabel>
          <DropdownMenuItem onClick={insertFootnote}>
            <Footprints className="h-4 w-4 mr-2" />
            脚注
          </DropdownMenuItem>
          <DropdownMenuItem onClick={insertHorizontalRule}>
            <Minus className="h-4 w-4 mr-2" />
            分割线
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-5 sm:h-6 mx-0.5 sm:mx-1 hidden sm:block" />

      {/* 撤销/重做 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        aria-label="Undo"
        className="rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0"
      >
        <Undo className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        aria-label="Redo"
        className="rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0"
      >
        <Redo className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Button>

      <Separator orientation="vertical" className="h-5 sm:h-6 mx-0.5 sm:mx-1 hidden sm:block" />

      {/* 键盘快捷键帮助 */}
      <KeyboardShortcutsHelp />
    </div>
  )
}
