import { schemaCtx } from '@milkdown/kit/core'
import type { Node as ProseMirrorNode } from '@milkdown/kit/prose/model'
import type { EditorState } from '@milkdown/kit/prose/state'
import { Plugin, PluginKey, TextSelection } from '@milkdown/kit/prose/state'
import { $prose } from '@milkdown/kit/utils'

/**
 * 在编辑器中输入 Markdown 行内语法后按 **空格** 或 **回车** 自动转换：
 *
 * - `[文字](链接)` → 超链接
 * - `![alt](图片地址)` → 图片节点
 *
 * Milkdown 自带的 InputRule 依赖 handleTextInput，
 * 容易被其他插件拦截导致不触发。
 * 本插件统一通过 handleKeyDown 拦截，更加可靠。
 */

const LINK_RE = /\[([^\]]+)\]\(([^\s)]+)\)$/
const IMAGE_RE = /!\[([^\]]*)\]\(([^\s)]+)\)$/

const inlineLinkInput = $prose((ctx) => {
  const schema = ctx.get(schemaCtx)

  /** 检测光标前的 `[text](url)` 链接模式 */
  function detectLink(state: EditorState, cursorPos: number) {
    const $pos = state.doc.resolve(cursorPos)
    const textBefore = $pos.parent.textBetween(0, $pos.parentOffset, null, '\ufffc')

    const match = textBefore.match(LINK_RE)
    if (!match) return null

    const [fullMatch, linkText, href] = match
    if (!linkText || !href) return null

    const linkMark = schema.marks.link?.create({ href })
    if (!linkMark) return null

    return {
      matchStart: cursorPos - fullMatch.length,
      matchEnd: cursorPos,
      nodes: [schema.text(linkText, [linkMark])],
    }
  }

  /** 检测光标前的 `![alt](url)` 图片模式 */
  function detectImage(state: EditorState, cursorPos: number) {
    const $pos = state.doc.resolve(cursorPos)
    const textBefore = $pos.parent.textBetween(0, $pos.parentOffset, null, '\ufffc')

    const match = textBefore.match(IMAGE_RE)
    if (!match) return null

    const [fullMatch, alt, src] = match
    if (!src) return null

    const imageType = schema.nodes.image
    if (!imageType) return null

    const imageNode = imageType.create({ src, alt: alt || '', title: alt || '' })
    if (!imageNode) return null

    return {
      matchStart: cursorPos - fullMatch.length,
      matchEnd: cursorPos,
      nodes: [imageNode],
    }
  }

  /** 依次尝试匹配图片和链接（图片优先，因为 `![` 是 `[` 的超集） */
  function detect(state: EditorState, cursorPos: number): {
    matchStart: number
    matchEnd: number
    nodes: ProseMirrorNode[]
  } | null {
    return detectImage(state, cursorPos) ?? detectLink(state, cursorPos)
  }

  return new Plugin({
    key: new PluginKey('inline-link-image-input'),
    props: {
      handleKeyDown(view, event) {
        const isSpace = event.key === ' '
        const isEnter = event.key === 'Enter'
        if (!isSpace && !isEnter) return false

        const { state } = view
        if (!(state.selection instanceof TextSelection)) return false
        const { $cursor } = state.selection
        if (!$cursor) return false

        const result = detect(state, $cursor.pos)
        if (!result) return false

        const { matchStart, matchEnd, nodes } = result

        if (isSpace) {
          // 替换匹配文本为节点 + 空格，消费按键事件
          const tr = state.tr.replaceWith(matchStart, matchEnd, [
            ...nodes,
            schema.text(' '),
          ])
          view.dispatch(tr)
          return true
        }

        // Enter：只做转换，不消费事件，让后续 keymap 继续处理换行
        const tr = state.tr.replaceWith(matchStart, matchEnd, nodes)
        view.dispatch(tr)
        return false
      },
    },
  })
})

export default inlineLinkInput
