import { editorViewOptionsCtx } from '@milkdown/kit/core'
import { Plugin, PluginKey } from '@milkdown/kit/prose/state'
import { $prose } from '@milkdown/kit/utils'

/**
 * 只读模式下，点击超链接自动在新标签页打开目标地址。
 *
 * 使用 handleDOMEvents.click 在 DOM 层面拦截点击，
 * 确保在浏览器处理 <a> 默认跳转之前阻止它。
 */
const clickableLink = $prose((ctx) => {
  return new Plugin({
    key: new PluginKey('clickable-link'),
    props: {
      handleDOMEvents: {
        click(view, event) {
          // 仅在只读模式下生效
          const editable = ctx.get(editorViewOptionsCtx).editable
          if (typeof editable === 'function' ? editable(view.state) : editable !== false)
            return false

          // 沿 DOM 树向上查找最近的 <a> 元素
          const anchor = (event.target as HTMLElement).closest('a')
          if (!anchor) return false

          const href = anchor.getAttribute('href')
          if (!href) return false

          // 阻止默认跳转 + 阻止冒泡，避免当前页面也发生导航
          event.preventDefault()
          event.stopPropagation()
          window.open(href, '_blank', 'noopener,noreferrer')
          return true
        },
      },
    },
  })
})

export default clickableLink
