import { commandsCtx } from '@milkdown/kit/core'
import type { MilkdownPlugin } from '@milkdown/kit/ctx'
import { markRule } from '@milkdown/kit/prose'
import { toggleMark } from '@milkdown/kit/prose/commands'
import type { MarkdownNode, RemarkPluginRaw } from '@milkdown/kit/transformer'
import { $command, $inputRule, $markAttr, $markSchema, $remark, $useKeymap } from '@milkdown/kit/utils'

/* ------------------------------------------------------------------ */
/*  1. Remark 插件 — 解析 ++text++ 语法为 underline mdast 节点          */
/* ------------------------------------------------------------------ */

const UNDERLINE_RE = /\+\+(.+?)\+\+/g

/**
 * 将文本中的 ++text++ 拆分为 underline 节点和普通文本节点
 */
function splitUnderline(text: string): MarkdownNode[] {
  const parts: MarkdownNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  UNDERLINE_RE.lastIndex = 0
  while ((match = UNDERLINE_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) } as MarkdownNode)
    }
    parts.push({
      type: 'underline',
      children: [{ type: 'text', value: match[1] } as MarkdownNode],
    } as MarkdownNode)
    lastIndex = UNDERLINE_RE.lastIndex
  }

  if (parts.length === 0) return []

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) } as MarkdownNode)
  }

  return parts
}

/**
 * 递归遍历 mdast 树，处理包含 ++text++ 的文本节点
 */
function transformTextNodes(node: MarkdownNode) {
  if (!node.children) return

  const newChildren: MarkdownNode[] = []
  let changed = false

  for (const child of node.children) {
    if (child.type === 'text' && typeof child.value === 'string' && child.value.includes('++')) {
      const parts = splitUnderline(child.value)
      if (parts.length > 0) {
        newChildren.push(...parts)
        changed = true
        continue
      }
    }
    transformTextNodes(child)
    newChildren.push(child)
  }

  if (changed) {
    node.children = newChildren
  }
}

/**
 * Remark 插件：
 * - 解析阶段：将 ++text++ 转换为 underline 类型的 mdast 节点
 * - 序列化阶段：注册 toMarkdown handler，将 underline 节点输出为 ++text++
 */
// biome-ignore lint/suspicious/noExplicitAny: remark unified 处理器的 this 绑定类型无法精确声明
function remarkUnderlinePlugin(this: any) {
  // 注册 remark-stringify 的 toMarkdown 处理器
  const data = this.data() as Record<string, unknown[]>
  const extensions = (data.toMarkdownExtensions ??= [])
  extensions.push({
    handlers: {
      // biome-ignore lint/suspicious/noExplicitAny: mdast-util-to-markdown handler 签名使用内部类型
      underline(node: any, _parent: unknown, state: any, info: Record<string, unknown>) {
        const exit = state.enter('underline')
        const value = state.containerPhrasing(node, {
          ...info,
          before: '+',
          after: '+',
        })
        exit()
        return `++${value}++`
      },
    },
  })

  // 返回 mdast 树转换器（解析阶段使用）
  return (tree: MarkdownNode) => {
    transformTextNodes(tree)
  }
}

export const remarkUnderline = $remark(
  'remarkUnderline',
  () => remarkUnderlinePlugin as unknown as RemarkPluginRaw<unknown>,
)

/* ------------------------------------------------------------------ */
/*  2. Mark Attr                                                       */
/* ------------------------------------------------------------------ */

export const underlineAttr = $markAttr('underline')

/* ------------------------------------------------------------------ */
/*  3. Mark Schema                                                     */
/* ------------------------------------------------------------------ */

export const underlineSchema = $markSchema('underline', (ctx) => ({
  parseDOM: [
    { tag: 'u' },
    { tag: 'ins' },
    { style: 'text-decoration', getAttrs: (value) => (value === 'underline') as false },
  ],
  toDOM: (mark) => ['u', ctx.get(underlineAttr.key)(mark)],
  parseMarkdown: {
    match: (node) => node.type === 'underline',
    runner: (state, node, markType) => {
      state.openMark(markType)
      state.next(node.children as MarkdownNode[])
      state.closeMark(markType)
    },
  },
  toMarkdown: {
    match: (mark) => mark.type.name === 'underline',
    runner: (state, mark) => {
      state.withMark(mark, 'underline')
    },
  },
}))

/* ------------------------------------------------------------------ */
/*  4. Command — 切换下划线                                             */
/* ------------------------------------------------------------------ */

export const toggleUnderlineCommand = $command('ToggleUnderline', (ctx) => () => {
  return toggleMark(underlineSchema.type(ctx))
})

/* ------------------------------------------------------------------ */
/*  5. InputRule — 输入 ++text++ 自动应用下划线                         */
/* ------------------------------------------------------------------ */

export const underlineInputRule = $inputRule((ctx) => {
  return markRule(
    /(?<!\+)\+\+([^+]+)\+\+$/,
    underlineSchema.type(ctx),
  )
})

/* ------------------------------------------------------------------ */
/*  6. Keymap — Mod-u 快捷键                                           */
/* ------------------------------------------------------------------ */

export const underlineKeymap = $useKeymap('underlineKeymap', {
  ToggleUnderline: {
    shortcuts: 'Mod-u',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(toggleUnderlineCommand.key)
    },
  },
})

/* ------------------------------------------------------------------ */
/*  7. 聚合导出                                                       */
/* ------------------------------------------------------------------ */

export const underline: MilkdownPlugin[] = [
  ...remarkUnderline,
  underlineAttr,
  ...underlineSchema,
  toggleUnderlineCommand,
  underlineInputRule,
  ...underlineKeymap,
]
