import type { Node as ProseMirrorNode } from '@milkdown/kit/prose/model'
import { TextSelection } from '@milkdown/kit/prose/state'
import type { EditorView, NodeView } from '@milkdown/kit/prose/view'
import type { KatexOptions } from 'katex'
import katex from 'katex'

/* ================================================================== */
/*  统一交互：点击公式 → 编辑 → 点击外部 / Escape → 保存渲染              */
/* ================================================================== */

/* ------------------------------------------------------------------ */
/*  块级公式 NodeView                                                   */
/* ------------------------------------------------------------------ */

type MathMode = 'viewing' | 'editing'

export function createMathBlockNodeView(
  node: ProseMirrorNode,
  view: EditorView,
  getPos: () => number | undefined,
  katexOptions: KatexOptions = {},
): NodeView {
  /* ---- DOM ---- */
  const container = document.createElement('div')
  container.className = 'math-block-container'

  const viewerEl = document.createElement('div')
  viewerEl.className = 'math-block-viewer'

  const editorEl = document.createElement('pre')
  editorEl.className = 'math-block-editor'
  const codeEl = document.createElement('code')
  codeEl.className = 'math-block-code'
  codeEl.tabIndex = 0
  editorEl.appendChild(codeEl)

  container.append(viewerEl, editorEl)

  /* ---- 状态 ---- */
  let currentCode = node.textContent
  let mode: MathMode = currentCode.trim().length === 0 ? 'editing' : 'viewing'

  /* ---- KaTeX 渲染 ---- */
  const renderKatex = (code: string) => {
    if (!code.trim()) {
      viewerEl.innerHTML =
        '<span class="math-block-placeholder">点击输入 LaTeX 公式…</span>'
      return
    }
    try {
      katex.render(code, viewerEl, {
        throwOnError: false,
        displayMode: true,
        ...katexOptions,
      })
    } catch {
      viewerEl.textContent = code
    }
  }

  /* ---- 模式切换 ---- */
  const applyMode = () => {
    const isView = mode === 'viewing'
    viewerEl.style.display = isView ? '' : 'none'
    editorEl.style.display = isView ? 'none' : ''
    container.classList.toggle('math-editing', !isView)
  }

  const switchToEdit = () => {
    if (mode === 'editing') return
    mode = 'editing'
    applyMode()
    // 把 ProseMirror 光标放进 contentDOM 末尾
    requestAnimationFrame(() => {
      try {
        const pos = getPos()
        if (pos == null) return
        const $pos = view.state.doc.resolve(pos + 1) // 进入节点内部
        const endPos = pos + 1 + ($pos.parent.content.size ?? 0)
        const sel = TextSelection.create(view.state.doc, endPos)
        view.dispatch(view.state.tr.setSelection(sel))
        view.focus()
      } catch {
        // 降级：直接 focus 编辑区
        view.focus()
      }
    })
  }

  const switchToView = () => {
    if (mode === 'viewing') return
    mode = 'viewing'
    currentCode = codeEl.textContent || currentCode
    if (currentCode.trim()) renderKatex(currentCode)
    else
      viewerEl.innerHTML =
        '<span class="math-block-placeholder">点击输入 LaTeX 公式…</span>'
    applyMode()
  }

  /* ---- 事件：点击渲染区 → 进入编辑 ---- */
  viewerEl.addEventListener('mousedown', (e) => {
    e.preventDefault()
    e.stopPropagation()
    switchToEdit()
  })

  /* ---- 事件：点击外部 → 退出编辑 ---- */
  const handleClickOutside = (e: MouseEvent) => {
    if (mode === 'editing' && !container.contains(e.target as Node)) {
      switchToView()
    }
  }
  document.addEventListener('mousedown', handleClickOutside, true)

  /* ---- 初始化 ---- */
  applyMode()
  if (mode === 'viewing' && currentCode.trim()) renderKatex(currentCode)

  /* ---- 返回 NodeView ---- */
  return {
    dom: container,
    contentDOM: codeEl,

    update(updatedNode: ProseMirrorNode) {
      if (updatedNode.type !== node.type) return false
      const newCode = updatedNode.textContent
      if (newCode !== currentCode) {
        currentCode = newCode
        if (mode === 'viewing') {
          if (newCode.trim()) renderKatex(newCode)
          else
            viewerEl.innerHTML =
              '<span class="math-block-placeholder">点击输入 LaTeX 公式…</span>'
        }
      }
      return true
    },

    stopEvent(event: Event) {
      // 查看模式下拦截渲染区上的所有事件
      if (mode === 'viewing' && viewerEl.contains(event.target as Node)) {
        return true
      }
      return false
    },

    ignoreMutation(mutation) {
      const target = mutation.target as Node
      // 只让 ProseMirror 处理 contentDOM (codeEl) 内部的变更
      if (codeEl.contains(target) || target === codeEl) return false
      // 其余全部忽略（我们自己管理的 DOM：渲染区、样式切换等）
      return true
    },

    destroy() {
      document.removeEventListener('mousedown', handleClickOutside, true)
    },
  }
}

/* ------------------------------------------------------------------ */
/*  行内公式 NodeView                                                   */
/* ------------------------------------------------------------------ */

export function createMathInlineNodeView(
  node: ProseMirrorNode,
  view: EditorView,
  getPos: () => number | undefined,
  katexOptions: KatexOptions = {},
): NodeView {
  /* ---- DOM ---- */
  const dom = document.createElement('span')
  dom.className = 'math-inline-wrapper'

  const renderEl = document.createElement('span')
  renderEl.className = 'math-inline-render'
  dom.appendChild(renderEl)

  const inputEl = document.createElement('input')
  inputEl.type = 'text'
  inputEl.className = 'math-inline-input'
  inputEl.spellcheck = false
  dom.appendChild(inputEl)

  /* ---- 状态 ---- */
  let currentCode = node.textContent
  let isEditing = false

  /* ---- KaTeX 渲染 ---- */
  const renderKatex = (code: string) => {
    if (!code.trim()) {
      renderEl.innerHTML = '<span class="math-inline-placeholder">$</span>'
      return
    }
    try {
      katex.render(code, renderEl, {
        throwOnError: false,
        displayMode: false,
        ...katexOptions,
      })
    } catch {
      renderEl.textContent = code
    }
  }

  /* ---- 模式切换（与块级统一：点击编辑 / 点击外部保存） ---- */
  const switchToEdit = () => {
    if (isEditing) return
    isEditing = true
    dom.classList.add('math-editing')
    inputEl.value = currentCode
    requestAnimationFrame(() => {
      inputEl.focus()
      inputEl.select()
    })
  }

  const commitAndView = () => {
    if (!isEditing) return
    const newCode = inputEl.value
    isEditing = false
    dom.classList.remove('math-editing')

    if (newCode !== currentCode) {
      currentCode = newCode
      renderKatex(newCode)
      const pos = getPos()
      if (pos != null) {
        const { tr, schema } = view.state
        const newNode = node.type.create(
          null,
          newCode ? schema.text(newCode) : null,
        )
        view.dispatch(tr.replaceWith(pos, pos + node.nodeSize, newNode))
      }
    }
  }

  /* ---- 事件：Enter / Escape → 保存 ---- */
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      commitAndView()
      view.focus()
    }
  })

  /* ---- 事件：点击外部 → 保存（与块级一致） ---- */
  const handleClickOutside = (e: MouseEvent) => {
    if (isEditing && !dom.contains(e.target as Node)) {
      commitAndView()
    }
  }
  document.addEventListener('mousedown', handleClickOutside, true)

  /* ---- 初始化 ---- */
  renderKatex(currentCode)

  /* ---- 返回 NodeView ---- */
  return {
    dom,

    selectNode() {
      switchToEdit()
    },

    deselectNode() {
      if (isEditing) commitAndView()
    },

    update(updatedNode: ProseMirrorNode) {
      if (updatedNode.type.name !== node.type.name) return false
      node = updatedNode
      currentCode = updatedNode.textContent
      if (!isEditing) renderKatex(currentCode)
      return true
    },

    stopEvent(event: Event) {
      if (isEditing && event.target === inputEl) return true
      return false
    },

    ignoreMutation() {
      return true
    },

    destroy() {
      document.removeEventListener('mousedown', handleClickOutside, true)
    },
  }
}
