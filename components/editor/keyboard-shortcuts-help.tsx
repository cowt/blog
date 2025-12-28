"use client"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Keyboard } from "lucide-react"

const shortcuts = [
  { category: "文本格式", items: [
    { keys: ["Cmd", "B"], description: "加粗" },
    { keys: ["Cmd", "I"], description: "斜体" },
    { keys: ["Cmd", "K"], description: "添加链接" },
    { keys: ["Cmd", "`"], description: "行内代码" },
  ]},
  { category: "标题", items: [
    { keys: ["Cmd", "Alt", "1"], description: "一级标题" },
    { keys: ["Cmd", "Alt", "2"], description: "二级标题" },
    { keys: ["Cmd", "Alt", "3"], description: "三级标题" },
  ]},
  { category: "列表", items: [
    { keys: ["Cmd", "Shift", "8"], description: "无序列表" },
    { keys: ["Cmd", "Shift", "7"], description: "有序列表" },
    { keys: ["Cmd", "Shift", "L"], description: "任务列表" },
    { keys: ["Tab"], description: "增加缩进（列表项）" },
    { keys: ["Shift", "Tab"], description: "减少缩进（列表项）" },
  ]},
  { category: "缩进", items: [
    { keys: ["Cmd", "]"], description: "增加缩进" },
    { keys: ["Cmd", "["], description: "减少缩进" },
    { keys: ["Tab"], description: "列表项缩进" },
    { keys: ["Shift", "Tab"], description: "列表项减少缩进" },
  ]},
  { category: "插入", items: [
    { keys: ["Cmd", "Alt", "I"], description: "插入图片" },
    { keys: ["Cmd", "Alt", "T"], description: "插入表格" },
    { keys: ["Cmd", "Alt", "C"], description: "代码块" },
    { keys: ["Cmd", "Shift", "D"], description: "折叠块" },
  ]},
  { category: "快捷输入", items: [
    { keys: [":::"], description: "输入后按空格创建折叠块" },
    { keys: ["```"], description: "输入后按空格创建代码块" },
    { keys: ["---"], description: "输入后按空格创建分割线" },
  ]},
]

export function KeyboardShortcutsHelp() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="rounded-full w-7 h-7 sm:w-8 sm:h-8 p-0"
          aria-label="Keyboard shortcuts"
        >
          <Keyboard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-96 overflow-y-auto" align="end">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">键盘快捷键</h4>
          {shortcuts.map((category) => (
            <div key={category.category} className="space-y-2">
              <h5 className="text-xs font-medium text-muted-foreground">
                {category.category}
              </h5>
              <div className="space-y-1">
                {category.items.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}