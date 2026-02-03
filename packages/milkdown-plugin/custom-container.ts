import type { MilkdownPlugin } from '@milkdown/kit/ctx'
import { InputRule } from '@milkdown/kit/prose/inputrules'
import { Selection } from '@milkdown/kit/prose/state'
import { $inputRule, $node, $remark } from '@milkdown/kit/utils'
import directive from 'remark-directive'

/**
 * 自定义容器插件
 * 支持语法（兼容 VitePress/RSPress）：
 * 
 * ::: type 标题
 * 内容
 * :::
 * 
 * 或标准语法：
 * :::type[标题]
 * 内容
 * :::
 */

// 注册 remark-directive 插件来解析 ::: 语法
export const remarkDirectivePlugin = $remark('remarkDirective', () => directive)

// 定义容器节点的 schema
export const containerNode = $node('container', () => ({
  group: 'block',
  content: 'block+',
  defining: true,
  attrs: {
    type: { default: 'info' },
    title: { default: '' },
  },
  parseDOM: [
    {
      tag: 'div.custom-container',
      getAttrs: (dom) => {
        const element = dom as HTMLElement
        return {
          type: element.dataset.type || 'info',
          title: element.dataset.title || '',
        }
      },
      // 指定内容应该从哪个子元素中解析
      contentElement: 'div.custom-container-content',
    },
  ],
  toDOM: (node) => {
    const { type, title } = node.attrs
    return [
      'div',
      {
        class: `custom-container custom-container-${type}`,
        'data-type': type,
        'data-title': title,
      },
      // 标题部分
      title
        ? ['p', { class: 'custom-container-title' }, title]
        : ['p', { class: 'custom-container-title' }, type.toUpperCase()],
      // 内容区域
      ['div', { class: 'custom-container-content' }, 0],
    ]
  },
  parseMarkdown: {
    match: (node) => {
      return node.type === 'containerDirective'
    },
    runner: (state, node, type) => {
      const containerType = (node.name as string) || 'info'
      type ChildNode = { 
        type: string
        value?: string
        data?: { directiveLabel?: boolean }
        children?: Array<{ type: string; value?: string }> 
      }
      const originalChildren = node.children as ChildNode[]
      
      // 获取标题：从 directive label 获取（:::type[标题] 格式）
      let directiveLabel = ''
      let contentChildren = originalChildren
      
      // remark-directive 在解析 :::type[label] 时，会把 label 放在第一个 paragraph 中
      // 并在该 paragraph 的 data 上设置 directiveLabel: true
      // 注意：标题段落应该只包含一个纯文本节点
      if (originalChildren.length > 0) {
        const firstChild = originalChildren[0]
        // 检查第一个段落是否是 directive label（必须满足以下所有条件）
        const isLabel = firstChild.data?.directiveLabel === true
        const isParagraph = firstChild.type === 'paragraph'
        const hasOnlyOneTextChild = firstChild.children?.length === 1 && 
                                    firstChild.children[0].type === 'text'
        
        if (isLabel && isParagraph && hasOnlyOneTextChild) {
          const textNode = firstChild.children![0]
          if (textNode.value) {
            directiveLabel = textNode.value
            // 创建新数组，跳过第一个元素（标题段落）
            contentChildren = originalChildren.slice(1)
          }
        }
      }
      
      state.openNode(type, { 
        type: containerType,
        title: directiveLabel,
      })
      state.next(contentChildren as Parameters<typeof state.next>[0])
      state.closeNode()
    },
  },
  toMarkdown: {
    match: (node) => node.type.name === 'container',
    runner: (state, node) => {
      const { type, title } = node.attrs
      state.openNode('containerDirective', undefined, { 
        name: type, 
        attributes: title ? { title: title as string } : {} 
      })
      state.next(node.content)
      state.closeNode()
    },
  },
}))

// 输入规则：在行首输入 :::type 或 :::type[标题] 后按空格创建容器
export const containerInputRule = $inputRule((ctx) => {
  return new InputRule(
    /^:::(\w+)(?:\[([^\]]*)\])?\s$/,
    (state, match, start, end) => {
      const nodeType = containerNode.type(ctx)
      const [, type = 'info', title = ''] = match
      
      const paragraph = state.schema.nodes.paragraph.createAndFill()
      if (!paragraph) return null
      
      const containerNodeInstance = nodeType.create(
        { type, title: title?.trim() || '' },
        paragraph
      )
      
      // 删除输入的文本，插入容器，并将光标移到容器内部
      const tr = state.tr
        .delete(start, end)
        .replaceSelectionWith(containerNodeInstance)
      
      // 计算容器内部段落的位置（容器开始位置 + 1 进入内容区域）
      const insidePos = start + 1
      tr.setSelection(Selection.near(tr.doc.resolve(insidePos)))
      
      return tr
    }
  )
})

/**
 * 预处理 Markdown 内容，将 VitePress 风格的容器语法转换为标准格式
 * 使用方法：在设置 defaultValueCtx 之前调用
 * 
 * @example
 * ctx.set(defaultValueCtx, preprocessContainerSyntax(mdContent))
 */
export function preprocessContainerSyntax(markdown: string): string {
  return markdown.replace(
    /^(:{3,})(\w+)\s+([^\n\[\]]+)$/gm,
    (_match, colons: string, type: string, title: string) => {
      return `${colons}${type}[${title.trim()}]`
    }
  )
}

// 导出所有插件
const customContainer: MilkdownPlugin[] = [
  ...remarkDirectivePlugin,
  containerNode,
  containerInputRule,
]

export default customContainer
