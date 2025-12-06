"use client"

import { BubbleMenu } from "@tiptap/react/menus"
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

interface TableMenuProps {
  editor: Editor
}

export function TableMenu({ editor }: TableMenuProps) {
  if (!editor) {
    return null
  }

  const buttonClass =
    "p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor }) => editor.isActive("table")}
      className="flex items-center gap-0.5 rounded-lg border bg-background p-1 shadow-md"
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
          <DropdownMenuItem onClick={() => editor.chain().focus().addRowBefore().run()}>
            <ArrowUp className="h-4 w-4 mr-2" />
            上方插入行
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().addRowAfter().run()}>
            <ArrowDown className="h-4 w-4 mr-2" />
            下方插入行
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => editor.chain().focus().deleteRow().run()}
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
          <DropdownMenuItem onClick={() => editor.chain().focus().addColumnBefore().run()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            左侧插入列
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().addColumnAfter().run()}>
            <ArrowRight className="h-4 w-4 mr-2" />
            右侧插入列
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => editor.chain().focus().deleteColumn().run()}
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
        onClick={() => editor.chain().focus().addRowAfter().run()}
        className={buttonClass}
        title="下方插入行"
      >
        <RowsIcon className="h-4 w-4" />
        <span className="text-[10px] font-medium ml-0.5">+</span>
      </button>

      {/* 快捷：右侧插入列 */}
      <button
        onClick={() => editor.chain().focus().addColumnAfter().run()}
        className={buttonClass}
        title="右侧插入列"
      >
        <ColumnsIcon className="h-4 w-4" />
        <span className="text-[10px] font-medium ml-0.5">+</span>
      </button>

      <div className="w-px h-4 bg-border mx-0.5" />

      {/* 删除表格 */}
      <button
        onClick={() => editor.chain().focus().deleteTable().run()}
        className={cn(buttonClass, "text-destructive hover:text-destructive hover:bg-destructive/10")}
        title="删除表格"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </BubbleMenu>
  )
}
