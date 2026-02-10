import type { MilkdownPlugin } from '@milkdown/kit/ctx'
import type { Node as ProseMirrorNode } from '@milkdown/kit/prose/model'
import { Plugin } from '@milkdown/kit/prose/state'
import type { EditorView } from '@milkdown/kit/prose/view'
import { $ctx, $prose } from '@milkdown/kit/utils'
import type { MermaidNodeViewOptions } from './node-view'
import { createMermaidNodeView } from './node-view'

/* ------------------------------------------------------------------ */
/*  类型                                                               */
/* ------------------------------------------------------------------ */

export interface MermaidPluginOptions extends MermaidNodeViewOptions {
  /** 触发 Mermaid 渲染的语言标识，默认 `'mermaid'` */
  language?: string
}

/* ------------------------------------------------------------------ */
/*  配置 Ctx                                                           */
/* ------------------------------------------------------------------ */

export const mermaidConfig = $ctx(
  {
    language: 'mermaid',
    mermaidConfig: undefined as MermaidPluginOptions['mermaidConfig'],
    onError: undefined as MermaidPluginOptions['onError'],
  },
  'mermaidConfig',
)

/* ------------------------------------------------------------------ */
/*  辅助：从 code_fence / code_block 节点读取语言属性                     */
/* ------------------------------------------------------------------ */

function getCodeFenceLanguage(node: ProseMirrorNode): string | undefined {
  const attrs = node.attrs as Record<string, unknown>
  return (attrs.language ?? attrs.lang ?? attrs.params ?? attrs.info) as string | undefined
}

/* ------------------------------------------------------------------ */
/*  ProseMirror 插件 — 为 mermaid 代码块注入自定义 NodeView               */
/* ------------------------------------------------------------------ */

export const mermaidPlugin = $prose((ctx) => {
  const getCfg = () => ctx.get(mermaidConfig.key)

  const nodeViewFactory = (node: ProseMirrorNode, view: EditorView) => {
    const cfg = getCfg()
    if (getCodeFenceLanguage(node) !== cfg.language) {
      // 非 mermaid 代码块回退到默认渲染
      return null as unknown as ReturnType<typeof createMermaidNodeView>
    }
    return createMermaidNodeView(node, view, {
      mermaidConfig: cfg.mermaidConfig,
      onError: cfg.onError,
    })
  }

  return new Plugin({
    props: {
      nodeViews: {
        code_fence: nodeViewFactory,
        code_block: nodeViewFactory,
      },
    },
  })
})

/* ------------------------------------------------------------------ */
/*  聚合导出                                                           */
/* ------------------------------------------------------------------ */

/** 一次性 `.use(mermaid)` 即可 */
export const mermaid: MilkdownPlugin[] = [mermaidPlugin, mermaidConfig]

export { createMermaidNodeView, type MermaidNodeViewOptions } from './node-view'
export { clearMermaidCache, renderMermaid } from './render'
