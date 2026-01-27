import { schemaCtx } from '@milkdown/kit/core'
import { GapCursor } from '@milkdown/kit/prose/gapcursor'
import { Plugin, PluginKey } from '@milkdown/kit/prose/state'
import { $prose } from '@milkdown/kit/utils'

/**
 * 保证文档末尾始终有一个空段落，
 * 这样光标就不会被"困"在末尾的代码块（或其他非段落块）里。
 */
const trailingParagraph = $prose((ctx) => {
  const schema = ctx.get(schemaCtx)

  return new Plugin({
    key: new PluginKey('trailing-paragraph'),
    appendTransaction(_, __, newState) {
      // gap cursor 激活时不插入，避免顶掉横线光标
      if (newState.selection instanceof GapCursor) return null

      const { doc } = newState
      const lastNode = doc.lastChild

      // 如果文档末尾已经是空段落，就不需要插入
      if (
        lastNode
        && lastNode.type === schema.nodes.paragraph
        && lastNode.childCount === 0
      ) {
        return null
      }

      // 在文档末尾插入一个空段落
      const paragraph = schema.nodes.paragraph.createAndFill()
      if (!paragraph) return null

      return newState.tr.insert(doc.content.size, paragraph)
    },
  })
})

export default trailingParagraph
