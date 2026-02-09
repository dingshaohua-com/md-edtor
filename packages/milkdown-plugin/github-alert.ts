import type { MilkdownPlugin } from '@milkdown/kit/ctx'
import { wrappingInputRule } from '@milkdown/kit/prose/inputrules'
import type { MarkdownNode, RemarkPluginRaw } from '@milkdown/kit/transformer'
import { $inputRule, $nodeAttr, $nodeSchema, $remark } from '@milkdown/kit/utils'

/* ------------------------------------------------------------------ */
/*  常量                                                              */
/* ------------------------------------------------------------------ */

const ALERT_TYPES = ['note', 'tip', 'important', 'warning', 'caution'] as const
type AlertType = (typeof ALERT_TYPES)[number]

/** 每种类型对应的中文标签 */
const ALERT_LABELS: Record<AlertType, string> = {
  note: 'Note',
  tip: 'Tip',
  important: 'Important',
  warning: 'Warning',
  caution: 'Caution',
}


/* ------------------------------------------------------------------ */
/*  1. Remark 插件 — 将 blockquote [!TYPE] 转化为自定义 AST 节点        */
/* ------------------------------------------------------------------ */

const ALERT_RE = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n?/i

function visitNode(node: MarkdownNode) {
  if (!node.children) return
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i]!
    if (child.type === 'blockquote') {
      const transformed = tryTransformBlockquote(child)
      if (transformed) node.children[i] = transformed
    }
    visitNode(child)
  }
}

/**
 * 把 `> [!NOTE]\n> xxx` 这种 blockquote
 * 转换成 type = 'github_alert' 的自定义 AST 节点
 */
function tryTransformBlockquote(node: MarkdownNode): MarkdownNode | null {
  const firstChild = node.children?.[0]
  if (firstChild?.type !== 'paragraph') return null

  const firstText = firstChild.children?.[0]
  if (firstText?.type !== 'text' || typeof firstText.value !== 'string')
    return null

  const match = firstText.value.match(ALERT_RE)
  if (!match) return null

  const alertType = match[1]!.toLowerCase() as AlertType
  const remaining = firstText.value.slice(match[0].length)

  // 克隆 children 以避免污染原始节点
  const children = [...(node.children ?? [])]
  const firstParagraph = { ...children[0]!, children: [...(children[0]!.children ?? [])] }
  children[0] = firstParagraph

  if (remaining) {
    // 还有剩余文本，更新第一个 text 节点
    firstParagraph.children[0] = { ...firstParagraph.children[0]!, value: remaining }
  } else if (firstParagraph.children.length > 1) {
    // 有其他内联节点，只移除空的第一个 text
    firstParagraph.children = firstParagraph.children.slice(1)
  } else {
    // 整个第一段都只有 [!TYPE]，移除整个段落
    children.shift()
  }

  return {
    type: 'github_alert',
    children,
    data: { alertType },
    position: node.position,
  } as MarkdownNode
}

function remarkGithubAlert() {
  return (tree: MarkdownNode) => {
    visitNode(tree)
  }
}

/* ------------------------------------------------------------------ */
/*  2. Milkdown Remark 包装器                                         */
/* ------------------------------------------------------------------ */

export const remarkGithubAlertPlugin = $remark(
  'remarkGithubAlert',
  () => remarkGithubAlert as unknown as RemarkPluginRaw<unknown>,
)

/* ------------------------------------------------------------------ */
/*  3. ProseMirror Node Attr                                          */
/* ------------------------------------------------------------------ */

export const githubAlertAttr = $nodeAttr('github_alert')

/* ------------------------------------------------------------------ */
/*  4. ProseMirror Node Schema                                        */
/* ------------------------------------------------------------------ */

export const githubAlertSchema = $nodeSchema('github_alert', (ctx) => ({
  content: 'block+',
  group: 'block',
  defining: true,
  attrs: {
    alertType: { default: 'note' },
  },
  parseDOM: [
    {
      tag: 'div[data-alert-type]',
      getAttrs: (dom) => ({
        alertType: (dom as HTMLElement).getAttribute('data-alert-type') || 'note',
      }),
    },
  ],
  toDOM: (node) => {
    const alertType = node.attrs.alertType as AlertType
    const label = ALERT_LABELS[alertType] ?? alertType

    return [
      'div',
      {
        class: `github-alert github-alert-${alertType}`,
        'data-alert-type': alertType,
        ...ctx.get(githubAlertAttr.key)(node),
      },
      [
        'div',
        {
          class: 'github-alert-title',
          contenteditable: 'false',
        },
        [
          'span',
          {
            class: 'github-alert-icon',
            // innerHTML 在 toDOM 里无法直接用，
            // 我们通过 CSS content 来展示图标
          },
        ],
        ['span', { class: 'github-alert-label' }, label],
      ],
      ['div', { class: 'github-alert-body' }, 0],
    ] as unknown as readonly [string, ...unknown[]]
  },
  parseMarkdown: {
    match: (node: MarkdownNode) => node.type === 'github_alert',
    runner: (state, node, type) => {
      const alertType = ((node as MarkdownNode & { data?: { alertType?: string } }).data?.alertType) ?? 'note'
      state.openNode(type, { alertType })
      if (node.children) state.next(node.children as MarkdownNode[])
      state.closeNode()
    },
  },
  toMarkdown: {
    match: (node) => node.type.name === 'github_alert',
    runner: (state, node) => {
      const alertType = (node.attrs.alertType as string).toUpperCase()
      state.openNode('blockquote')
      // 生成 [!TYPE] 标记段落
      state.openNode('paragraph')
      state.addNode('text', undefined, `[!${alertType}]`)
      state.closeNode()
      // 序列化子内容
      state.next(node.content)
      state.closeNode()
    },
  },
}))

/* ------------------------------------------------------------------ */
/*  5. InputRule — 输入 `>[!note]` 自动创建 alert                      */
/* ------------------------------------------------------------------ */

export const githubAlertInputRule = $inputRule((ctx) => {
  return wrappingInputRule(
    /^\s*>\s*\[!(note|tip|important|warning|caution)\]\s*$/i,
    githubAlertSchema.type(ctx),
    (match) => ({ alertType: match[1]!.toLowerCase() }),
  )
})

/* ------------------------------------------------------------------ */
/*  6. 聚合导出                                                       */
/* ------------------------------------------------------------------ */

/**
 * 将所有子插件打包到一个数组中，方便一次性 `.use(githubAlert)`
 * 注意：$remark 和 $nodeSchema 都是 tuple，需要展开
 */
export const githubAlert: MilkdownPlugin[] = [
  ...remarkGithubAlertPlugin,
  githubAlertAttr,
  ...githubAlertSchema,
  githubAlertInputRule,
]
