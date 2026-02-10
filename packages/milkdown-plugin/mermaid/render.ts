import type { MermaidConfig } from 'mermaid'

let mermaidInitialized = false
let mermaidInitPromise: Promise<void> | null = null
let lastConfigKey: string | null = null
let renderSequence = 0

/** 缓存 key 包含 config，防止配置变更后返回旧 SVG */
const renderCache = new Map<string, string>()

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value) ?? ''
  } catch {
    return ''
  }
}

/** 懒加载并初始化 Mermaid */
async function initializeMermaid(config?: MermaidConfig): Promise<void> {
  if (typeof window === 'undefined') return

  const configKey = safeStringify(config ?? {})
  if (mermaidInitialized && lastConfigKey === configKey) return
  if (mermaidInitPromise && lastConfigKey === configKey) return mermaidInitPromise

  lastConfigKey = configKey
  mermaidInitPromise = import('mermaid').then((mod) => {
    mod.default.initialize({
      startOnLoad: false,
      theme: 'default',
      ...config,
    })
    mermaidInitialized = true
  })

  return mermaidInitPromise
}

/** 基于内容生成确定性 ID */
function generateDiagramId(content: string): string {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // 转为 32 位整数
  }
  return `mermaid-${Math.abs(hash)}`
}

/** 检测是否为甘特图 */
function isGanttChart(code: string): boolean {
  const trimmed = code.trim()
  return trimmed.startsWith('gantt') || (trimmed.startsWith('%%{init:') && trimmed.includes('gantt'))
}

/** 清理 Mermaid 渲染错误产生的遗留 DOM */
function cleanupMermaidErrorDom(hashPart: string, uniqueRenderId: string) {
  const errorSvgs = document.querySelectorAll('svg[aria-roledescription="error"]')
  for (const svg of errorSvgs) {
    const svgId = svg.getAttribute('id') || ''
    if (svgId.startsWith(uniqueRenderId) || svgId.includes(hashPart)) {
      const wrapper = svg.closest('div[id^="dmermaid-"]')
      if (wrapper) wrapper.remove()
      else svg.remove()
    }
  }
  const wrapperDivs = document.querySelectorAll('div[id^="dmermaid-"]')
  for (const div of wrapperDivs) {
    const divId = div.getAttribute('id') || ''
    if (divId.includes(hashPart) || divId.includes(uniqueRenderId)) {
      if (div.querySelector('svg[aria-roledescription="error"]')) div.remove()
    }
  }
}

/**
 * 将 Mermaid 代码渲染为 SVG
 * @returns 成功返回 `{ svg, id }`，失败返回 `{ error }`
 */
export async function renderMermaid(
  code: string,
  config?: MermaidConfig,
): Promise<{ svg: string; id: string } | { error: string }> {
  if (typeof window === 'undefined') {
    return { error: 'Mermaid rendering is only available in the browser' }
  }

  await initializeMermaid(config)

  const stableId = generateDiagramId(code)
  const cacheKey = `${stableId}|${safeStringify(config ?? {})}`

  if (renderCache.has(cacheKey)) {
    return { svg: renderCache.get(cacheKey)!, id: stableId }
  }

  try {
    const mermaid = await import('mermaid')

    // 创建临时离屏容器（需要可见以便 getBBox() 工作）
    const container = document.createElement('div')
    const uniqueRenderId = `${stableId}-${++renderSequence}`
    container.id = `${uniqueRenderId}-container`
    container.style.cssText = 'position:absolute;left:-9999px;top:0;pointer-events:none;overflow:hidden;'

    const isGantt = isGanttChart(code)
    container.style.width = isGantt ? '1200px' : '1000px'
    container.style.height = '1000px'
    document.body.appendChild(container)

    // 强制 reflow
    void container.offsetHeight

    const hashPart = stableId.replace(/^mermaid-/, '')

    try {
      await new Promise((resolve) => requestAnimationFrame(resolve))

      let result: { svg: string }
      if (isGantt) {
        result = await mermaid.default.render(uniqueRenderId, code, container)
      } else {
        try {
          result = await mermaid.default.render(uniqueRenderId, code)
        } catch {
          result = await mermaid.default.render(uniqueRenderId, code, container)
        }
      }

      renderCache.set(cacheKey, result.svg)
      return { svg: result.svg, id: stableId }
    } finally {
      container.parentNode?.removeChild(container)
      cleanupMermaidErrorDom(hashPart, uniqueRenderId)
    }
  } catch (error) {
    const hashPart = stableId.replace(/^mermaid-/, '')
    cleanupMermaidErrorDom(hashPart, stableId)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[mermaid-plugin] renderMermaid failed', {
      id: stableId,
      error: errorMessage,
      codePreview: code.slice(0, 200),
    })
    return { error: errorMessage }
  }
}

/** 清除渲染缓存 */
export function clearMermaidCache(): void {
  renderCache.clear()
}
