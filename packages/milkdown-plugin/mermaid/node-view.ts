import type { Node as ProseMirrorNode } from '@milkdown/kit/prose/model'
import type { EditorView, NodeView } from '@milkdown/kit/prose/view'
import type { MermaidConfig } from 'mermaid'
import { renderMermaid } from './render'

export interface MermaidNodeViewOptions {
  mermaidConfig?: MermaidConfig
  onError?: (error: string) => void
}

type MermaidMode = 'viewing' | 'editing'

/**
 * 创建 Mermaid 图表的 NodeView，支持「查看 / 编辑」双模式
 */
export function createMermaidNodeView(
  node: ProseMirrorNode,
  _view: EditorView,
  options: MermaidNodeViewOptions = {},
): NodeView {
  const { mermaidConfig, onError } = options

  /* ------------------------------------------------------------------ */
  /*  DOM 结构                                                           */
  /* ------------------------------------------------------------------ */

  const container = document.createElement('div')
  container.className = 'milkdown-mermaid-container'

  // 控制按钮
  const controlsContainer = document.createElement('div')
  controlsContainer.className = 'milkdown-mermaid-controls'
  const toggleButton = document.createElement('button')
  toggleButton.style.cssText =
    'padding:4px 12px;cursor:pointer;border:1px solid #ccc;background:#fff;border-radius:4px;font-size:12px;'
  controlsContainer.appendChild(toggleButton)

  // 查看区（SVG）
  const viewerEl = document.createElement('div')
  viewerEl.className = 'milkdown-mermaid-viewer'

  // 编辑区（contentDOM）
  const editorEl = document.createElement('pre')
  editorEl.className = 'milkdown-mermaid-editor'
  editorEl.style.cssText =
    'background-color:#f4f4f4;padding:1em;border-radius:6px;overflow-x:auto;margin:0;'
  const codeEl = document.createElement('code')
  codeEl.className = 'milkdown-mermaid-code'
  codeEl.tabIndex = 0
  editorEl.appendChild(codeEl)

  // 错误提示
  const errorContainer = document.createElement('div')
  errorContainer.className = 'milkdown-mermaid-error'
  errorContainer.style.cssText =
    'display:none;padding:8px;border:1px solid #ff6b6b;border-radius:4px;' +
    'background-color:#ffe0e0;color:#c92a2a;font-size:14px;margin-top:8px;' +
    'white-space:pre-wrap;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;'

  container.append(controlsContainer, viewerEl, editorEl, errorContainer)

  /* ------------------------------------------------------------------ */
  /*  状态                                                               */
  /* ------------------------------------------------------------------ */

  const normalize = (code: string) => code.replace(/\r\n/g, '\n')

  let renderTimeout: ReturnType<typeof setTimeout> | null = null
  let currentCode = normalize(node.textContent)
  let mode: MermaidMode = currentCode.trim().length === 0 ? 'editing' : 'viewing'
  let renderPending: string | null = null

  /* ------------------------------------------------------------------ */
  /*  辅助函数                                                           */
  /* ------------------------------------------------------------------ */

  const clearViewer = () => {
    errorContainer.style.display = 'none'
    errorContainer.textContent = ''
    viewerEl.querySelector('.milkdown-mermaid')?.remove()
  }

  const updateModeDisplay = () => {
    if (mode === 'viewing') {
      viewerEl.style.display = ''
      editorEl.style.display = 'none'
    } else {
      viewerEl.style.display = 'none'
      editorEl.style.display = ''
      requestAnimationFrame(() => codeEl.focus())
    }
  }

  /** 防抖渲染 */
  const renderDiagram = (code: string) => {
    if (renderTimeout) clearTimeout(renderTimeout)
    renderPending = code

    renderTimeout = setTimeout(async () => {
      if (renderPending !== code) return

      const result = await renderMermaid(code, mermaidConfig)
      if (renderPending !== code) return
      renderPending = null

      if ('error' in result) {
        errorContainer.textContent = result.error
        errorContainer.style.display = 'block'
        onError?.(result.error)
        viewerEl.querySelector('.milkdown-mermaid')?.remove()
      } else {
        errorContainer.style.display = 'none'
        viewerEl.querySelector('.milkdown-mermaid')?.remove()

        const svgWrapper = document.createElement('div')
        svgWrapper.className = 'milkdown-mermaid'
        svgWrapper.style.cssText =
          'display:flex;justify-content:flex-start;align-items:center;overflow-x:auto;overflow-y:hidden;width:100%;min-width:0;'
        svgWrapper.innerHTML = result.svg

        const svg = svgWrapper.querySelector('svg')
        if (svg) {
          svg.style.flexShrink = '0'
          svg.style.display = 'block'
          // 左对齐甘特图标题
          const titleText = svg.querySelector('.titleText')
          if (titleText) {
            titleText.setAttribute('x', '75')
            titleText.setAttribute('text-anchor', 'start')
          }
        }
        viewerEl.appendChild(svgWrapper)
      }
    }, mode === 'editing' ? 500 : 300)
  }

  /** 更新按钮文字与事件 */
  const updateControls = () => {
    toggleButton.textContent = mode === 'viewing' ? 'Edit' : 'View'
    toggleButton.className =
      mode === 'viewing' ? 'milkdown-mermaid-edit-button' : 'milkdown-mermaid-view-button'

    const preventAndStop = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()
    }

    toggleButton.onmousedown = (e) => {
      preventAndStop(e)
      return false
    }

    if (mode === 'viewing') {
      toggleButton.onclick = (e) => {
        preventAndStop(e)
        mode = 'editing'
        updateModeDisplay()
        updateControls()
        return false
      }
    } else {
      toggleButton.onclick = (e) => {
        preventAndStop(e)
        mode = 'viewing'
        const codeElText = codeEl.textContent || ''
        const nodeCode = normalize(node.textContent)
        currentCode = normalize(codeElText || currentCode || nodeCode)
        updateModeDisplay()
        updateControls()
        if (currentCode.trim().length > 0) renderDiagram(currentCode)
        else clearViewer()
        return false
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /*  初始化                                                             */
  /* ------------------------------------------------------------------ */

  updateModeDisplay()
  updateControls()
  if (mode === 'viewing' && currentCode.trim().length > 0) renderDiagram(currentCode)
  else if (mode === 'viewing') clearViewer()

  /* ------------------------------------------------------------------ */
  /*  返回 NodeView                                                      */
  /* ------------------------------------------------------------------ */

  return {
    dom: container,
    contentDOM: codeEl,

    update(updatedNode: ProseMirrorNode) {
      if (updatedNode.type !== node.type) return false

      const newCode = normalize(updatedNode.textContent)
      if (newCode !== currentCode) {
        currentCode = newCode
        if (mode === 'viewing') {
          if (newCode.trim().length > 0) renderDiagram(newCode)
          else clearViewer()
        }
      }
      updateModeDisplay()
      return true
    },

    stopEvent(event: Event) {
      if (event.target instanceof HTMLElement) {
        return event.target.closest('button') !== null
      }
      return false
    },

    ignoreMutation(mutation) {
      const target = mutation.target as Node
      // 始终让 ProseMirror 处理 contentDOM 的变更
      if (codeEl.contains(target) || target === codeEl) return false
      // 忽略我们自行管理的 DOM 变更
      return (
        viewerEl.contains(target) ||
        controlsContainer.contains(target) ||
        errorContainer.contains(target) ||
        target === errorContainer ||
        (editorEl.contains(target) && target !== codeEl) ||
        target === editorEl
      )
    },

    destroy() {
      if (renderTimeout) clearTimeout(renderTimeout)
      renderPending = null
    },
  }
}
