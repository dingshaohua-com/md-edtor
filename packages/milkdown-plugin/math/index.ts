import type { MilkdownPlugin } from '@milkdown/kit/ctx'
import { Fragment } from '@milkdown/kit/prose/model'
import { Plugin, PluginKey, TextSelection } from '@milkdown/kit/prose/state'
import { $ctx, $nodeSchema, $prose, $remark, $view } from '@milkdown/kit/utils'
import type { KatexOptions } from 'katex'
import remarkMath from 'remark-math'
import { createMathBlockNodeView, createMathInlineNodeView } from './node-view'

/* ================================================================== */
/*  1. Remark 插件 — 让 Markdown 解析器识别 $...$ 和 $$...$$ 语法        */
/* ================================================================== */

export const remarkMathPlugin = $remark<'remarkMath', undefined>(
  'remarkMath',
  () => remarkMath,
)

/* ================================================================== */
/*  2. KaTeX 配置上下文                                                 */
/* ================================================================== */

export const katexOptionsCtx = $ctx<KatexOptions, 'katexOptions'>(
  {},
  'katexOptions',
)

/* ================================================================== */
/*  3. 行内公式 Schema — atom: true, 点击后弹出 input 编辑               */
/* ================================================================== */

export const mathInlineSchema = $nodeSchema('math_inline', (_ctx) => ({
  group: 'inline',
  content: 'text*',
  inline: true,
  atom: true,
  parseDOM: [
    {
      tag: 'span[data-type="math_inline"]',
      getContent: (dom, schema) => {
        if (!(dom instanceof HTMLElement)) return Fragment.empty
        return Fragment.from(schema.text(dom.dataset.value ?? ''))
      },
    },
  ],
  toDOM: (node) => {
    const dom = document.createElement('span')
    dom.dataset.type = 'math_inline'
    dom.dataset.value = node.textContent
    dom.textContent = node.textContent
    return dom
  },
  parseMarkdown: {
    match: (node) => node.type === 'inlineMath',
    runner: (state, node, type) => {
      state.openNode(type).addText(node.value as string).closeNode()
    },
  },
  toMarkdown: {
    match: (node) => node.type.name === 'math_inline',
    runner: (state, node) => {
      state.addNode('inlineMath', undefined, node.textContent)
    },
  },
}))

/* ================================================================== */
/*  4. 块级公式 Schema — 非 atom, contentDOM 可直接编辑                  */
/* ================================================================== */

export const mathBlockSchema = $nodeSchema('math_block', (_ctx) => ({
  content: 'text*',
  group: 'block',
  marks: '',
  defining: true,
  isolating: true,
  parseDOM: [
    {
      tag: 'div[data-type="math_block"]',
      preserveWhitespace: 'full' as const,
      getContent: (dom, schema) => {
        if (!(dom instanceof HTMLElement)) return Fragment.empty
        return Fragment.from(schema.text(dom.dataset.value ?? ''))
      },
    },
  ],
  toDOM: (node) => {
    const dom = document.createElement('div')
    dom.dataset.type = 'math_block'
    dom.dataset.value = node.textContent
    dom.textContent = node.textContent
    return dom
  },
  parseMarkdown: {
    match: ({ type }) => type === 'math',
    runner: (state, node, type) => {
      const value = node.value as string
      state.openNode(type).addText(value).closeNode()
    },
  },
  toMarkdown: {
    match: (node) => node.type.name === 'math_block',
    runner: (state, node) => {
      state.addNode('math', undefined, node.textContent)
    },
  },
}))

/* ================================================================== */
/*  5. NodeView                                                        */
/* ================================================================== */

/** 行内公式 NodeView */
export const mathInlineView = $view(mathInlineSchema.node, (ctx) => {
  return (node, view, getPos) =>
    createMathInlineNodeView(
      node,
      view,
      getPos,
      ctx.get(katexOptionsCtx.key),
    )
})

/** 块级公式 NodeView */
export const mathBlockView = $view(mathBlockSchema.node, (ctx) => {
  return (node, view, getPos) =>
    createMathBlockNodeView(node, view, getPos, ctx.get(katexOptionsCtx.key))
})

/* ================================================================== */
/*  6. 输入触发 — 通过 handleKeyDown 拦截，比 InputRule 更可靠            */
/*     （与 inline-link-input.ts 同理：InputRule 容易被其他插件拦截）       */
/* ================================================================== */

const INLINE_MATH_RE = /\$([^$]+)\$$/
const BLOCK_MATH_RE = /^\$\$$/

export const mathInputPlugin = $prose((ctx) => {
  return new Plugin({
    key: new PluginKey('math-input'),
    props: {
      handleKeyDown(view, event) {
        const isSpace = event.key === ' '
        const isEnter = event.key === 'Enter'
        if (!isSpace && !isEnter) return false

        const { state } = view
        if (!(state.selection instanceof TextSelection)) return false
        const { $cursor } = state.selection
        if (!$cursor) return false

        const textBefore = $cursor.parent.textBetween(
          0,
          $cursor.parentOffset,
          null,
          '\ufffc',
        )

        /* ---------- 块级公式：在空行输入 $$ 后按空格/回车 ---------- */
        if (BLOCK_MATH_RE.test(textBefore)) {
          const blockType = mathBlockSchema.type(ctx)
          const startPos = $cursor.pos - textBefore.length
          const $start = state.doc.resolve(startPos)
          if (
            $start
              .node(-1)
              .canReplaceWith(
                $start.index(-1),
                $start.indexAfter(-1),
                blockType,
              )
          ) {
            const tr = state.tr
              .delete(startPos, $cursor.pos)
              .setBlockType(startPos, startPos, blockType)
            view.dispatch(tr)
            return true
          }
        }

        /* ---------- 行内公式：输入 $公式$ 后按空格/回车 ---------- */
        const inlineMatch = textBefore.match(INLINE_MATH_RE)
        if (inlineMatch) {
          const [fullMatch, content] = inlineMatch
          if (fullMatch && content) {
            const inlineType = mathInlineSchema.type(ctx)
            const matchStart = $cursor.pos - fullMatch.length
            const matchEnd = $cursor.pos
            const textNode = state.schema.text(content)
            const mathNode = inlineType.create(null, [textNode])

            if (isSpace) {
              // 替换为公式节点 + 空格，消费按键事件
              const tr = state.tr.replaceWith(matchStart, matchEnd, [
                mathNode,
                state.schema.text(' '),
              ])
              view.dispatch(tr)
              return true
            }

            // Enter：只做转换，不消费事件，让后续处理换行
            const tr = state.tr.replaceWith(matchStart, matchEnd, mathNode)
            view.dispatch(tr)
            return false
          }
        }

        return false
      },
    },
  })
})

/* ================================================================== */
/*  7. 聚合导出                                                        */
/* ================================================================== */

/** 一次性 `.use(math)` 即可 */
export const math: MilkdownPlugin[] = [
  ...remarkMathPlugin,
  katexOptionsCtx,
  ...mathInlineSchema,
  ...mathBlockSchema,
  mathInlineView,
  mathBlockView,
  mathInputPlugin,
]
