import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"

/**
 * 脚注同步扩展
 * - 删除正文中的脚注引用时，自动删除对应的脚注项
 * - 删除脚注项时，自动删除正文中的脚注引用
 * - 自动重新编号脚注
 */
export const FootnoteSync = Extension.create({
  name: "footnoteSync",

  addProseMirrorPlugins() {
    const pluginKey = new PluginKey("footnoteSync")

    return [
      new Plugin({
        key: pluginKey,
        appendTransaction(transactions, oldState, newState) {
          // 只处理有实际变化的事务
          const docChanged = transactions.some((tr) => tr.docChanged)
          if (!docChanged) return null

          // 收集旧文档和新文档中的脚注引用和脚注项
          const oldRefs = new Set<string>()
          const oldItems = new Set<string>()
          const newRefs = new Set<string>()
          const newItems = new Set<string>()

          oldState.doc.descendants((node) => {
            if (node.type.name === "footnoteRef" && node.attrs.id) {
              oldRefs.add(node.attrs.id)
            }
            if (node.type.name === "footnoteItem" && node.attrs.id) {
              oldItems.add(node.attrs.id)
            }
          })

          newState.doc.descendants((node) => {
            if (node.type.name === "footnoteRef" && node.attrs.id) {
              newRefs.add(node.attrs.id)
            }
            if (node.type.name === "footnoteItem" && node.attrs.id) {
              newItems.add(node.attrs.id)
            }
          })

          // 找出被删除的引用和脚注项
          const deletedRefs = [...oldRefs].filter((id) => !newRefs.has(id))
          const deletedItems = [...oldItems].filter((id) => !newItems.has(id))

          // 如果没有删除，不需要处理
          if (deletedRefs.length === 0 && deletedItems.length === 0) {
            return null
          }

          const tr = newState.tr

          // 删除引用时，删除对应的脚注项
          if (deletedRefs.length > 0) {
            const nodesToDelete: { pos: number; size: number }[] = []
            newState.doc.descendants((node, pos) => {
              if (node.type.name === "footnoteItem" && deletedRefs.includes(node.attrs.id)) {
                nodesToDelete.push({ pos, size: node.nodeSize })
              }
            })
            // 从后往前删除，避免位置偏移
            nodesToDelete.sort((a, b) => b.pos - a.pos)
            for (const { pos, size } of nodesToDelete) {
              tr.delete(pos, pos + size)
            }
          }

          // 删除脚注项时，删除对应的引用
          if (deletedItems.length > 0) {
            const nodesToDelete: { pos: number; size: number }[] = []
            newState.doc.descendants((node, pos) => {
              if (node.type.name === "footnoteRef" && deletedItems.includes(node.attrs.id)) {
                nodesToDelete.push({ pos, size: node.nodeSize })
              }
            })
            nodesToDelete.sort((a, b) => b.pos - a.pos)
            for (const { pos, size } of nodesToDelete) {
              tr.delete(pos, pos + size)
            }
          }

          // 如果有变化，重新编号脚注
          if (tr.docChanged) {
            // 收集所有脚注引用的位置和 id
            const refNodes: { pos: number; id: string }[] = []
            tr.doc.descendants((node, pos) => {
              if (node.type.name === "footnoteRef" && node.attrs.id) {
                refNodes.push({ pos, id: node.attrs.id })
              }
            })

            // 按位置排序，重新分配 label
            refNodes.sort((a, b) => a.pos - b.pos)
            const idToLabel = new Map<string, number>()
            refNodes.forEach((ref, index) => {
              idToLabel.set(ref.id, index + 1)
            })

            // 更新所有引用的 label
            refNodes.forEach((ref) => {
              const newLabel = idToLabel.get(ref.id)
              tr.setNodeMarkup(ref.pos, undefined, {
                id: ref.id,
                label: newLabel,
              })
            })
          }

          // 检查脚注列表是否为空，如果为空则删除整个列表
          let footnoteListPos = -1
          let footnoteListSize = 0
          let footnoteItemCount = 0
          tr.doc.descendants((node, pos) => {
            if (node.type.name === "footnoteList") {
              footnoteListPos = pos
              footnoteListSize = node.nodeSize
            }
            if (node.type.name === "footnoteItem") {
              footnoteItemCount++
            }
          })

          if (footnoteListPos >= 0 && footnoteItemCount === 0) {
            tr.delete(footnoteListPos, footnoteListPos + footnoteListSize)
          }

          return tr.docChanged ? tr : null
        },
      }),
    ]
  },
})
