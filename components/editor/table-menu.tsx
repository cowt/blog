"use client"

import { Editor } from "@tiptap/react"
import {
  Minus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  TableRowsSplit,
  TableColumnsSplit,
  RowsIcon,
  ColumnsIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState, useCallback, useRef } from "react"

interface TableMenuProps {
  editor: Editor
}

export function TableMenu({ editor }: TableMenuProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const menuRef = useRef<HTMLDivElement>(null)

  const updateMenu = useCallback(() => {
    if (!editor || editor.isDestroyed) return

    const isInTable = editor.isActive("table")
    if (!isInTable) {
      setIsVisible(false)
      return
    }

    // Find the table DOM element from current selection
    const { $from } = editor.state.selection
    let depth = $from.depth
    while (depth > 0) {
      if ($from.node(depth).type.name === "table") break
      depth--
    }

    if (depth === 0) {
      setIsVisible(false)
      return
    }

    const tableStart = $from.start(depth) - 1
    const dom = editor.view.nodeDOM(tableStart)
    if (!(dom instanceof HTMLElement)) {
      setIsVisible(false)
      return
    }

    // Position relative to the editor's scrollable container
    const container = editor.view.dom.closest(".relative") as HTMLElement
    if (!container) {
      setIsVisible(false)
      return
    }

    const tableRect = dom.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    const menuWidth = menuRef.current?.offsetWidth || 280
    let left = tableRect.left - containerRect.left + tableRect.width / 2 - menuWidth / 2

    // Clamp within container
    left = Math.max(4, Math.min(left, containerRect.width - menuWidth - 4))

    setPosition({
      top: tableRect.top - containerRect.top - 44,
      left,
    })
    setIsVisible(true)
  }, [editor])

  useEffect(() => {
    if (!editor || editor.isDestroyed) return

    const handler = () => updateMenu()

    editor.on("selectionUpdate", handler)
    editor.on("transaction", handler)

    // Initial check
    handler()

    return () => {
      editor.off("selectionUpdate", handler)
      editor.off("transaction", handler)
    }
  }, [editor, updateMenu])

  const runCommand = useCallback(
    (command: () => void) => {
      command()
      // Re-evaluate position after DOM change
      requestAnimationFrame(() => updateMenu())
    },
    [updateMenu]
  )

  if (!editor || !isVisible) return null

  const buttonClass =
    "p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"

  return (
    <div
      ref={menuRef}
      className="absolute z-50 flex items-center gap-0.5 rounded-lg border bg-background p-1 shadow-md"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {/* 插入行 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={buttonClass} title="插入行">
            <TableRowsSplit className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuPrimitive.Content
          align="center"
          side="bottom"
          sideOffset={8}
          className="bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md animate-in fade-in-0 zoom-in-95"
        >
          <DropdownMenuItem
            onClick={() =>
              runCommand(() => editor.chain().focus().addRowBefore().run())
            }
          >
            <ArrowUp className="h-4 w-4 mr-2" />
            上方插入行
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              runCommand(() => editor.chain().focus().addRowAfter().run())
            }
          >
            <ArrowDown className="h-4 w-4 mr-2" />
            下方插入行
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() =>
              runCommand(() => editor.chain().focus().deleteRow().run())
            }
            className="text-destructive focus:text-destructive"
          >
            <Minus className="h-4 w-4 mr-2" />
            删除当前行
          </DropdownMenuItem>
        </DropdownMenuPrimitive.Content>
      </DropdownMenu>

      {/* 插入列 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={buttonClass} title="插入列">
            <TableColumnsSplit className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuPrimitive.Content
          align="center"
          side="bottom"
          sideOffset={8}
          className="bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md animate-in fade-in-0 zoom-in-95"
        >
          <DropdownMenuItem
            onClick={() =>
              runCommand(() =>
                editor.chain().focus().addColumnBefore().run()
              )
            }
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            左侧插入列
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              runCommand(() =>
                editor.chain().focus().addColumnAfter().run()
              )
            }
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            右侧插入列
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() =>
              runCommand(() =>
                editor.chain().focus().deleteColumn().run()
              )
            }
            className="text-destructive focus:text-destructive"
          >
            <Minus className="h-4 w-4 mr-2" />
            删除当前列
          </DropdownMenuItem>
        </DropdownMenuPrimitive.Content>
      </DropdownMenu>

      <div className="w-px h-4 bg-border mx-0.5" />

      {/* 快捷：下方插入行 */}
      <button
        onClick={() =>
          runCommand(() => editor.chain().focus().addRowAfter().run())
        }
        className={buttonClass}
        title="下方插入行"
      >
        <RowsIcon className="h-4 w-4" />
        <span className="text-[10px] font-medium ml-0.5">+</span>
      </button>

      {/* 快捷：右侧插入列 */}
      <button
        onClick={() =>
          runCommand(() => editor.chain().focus().addColumnAfter().run())
        }
        className={buttonClass}
        title="右侧插入列"
      >
        <ColumnsIcon className="h-4 w-4" />
        <span className="text-[10px] font-medium ml-0.5">+</span>
      </button>

      <div className="w-px h-4 bg-border mx-0.5" />

      {/* 删除表格 */}
      <button
        onClick={() =>
          runCommand(() => editor.chain().focus().deleteTable().run())
        }
        className={cn(
          buttonClass,
          "text-destructive hover:text-destructive hover:bg-destructive/10"
        )}
        title="删除表格"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
