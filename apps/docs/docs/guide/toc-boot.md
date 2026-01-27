# 页内导航
既然你希望实现类似 **VitePress** 那种能够随内容滚动自动高亮、且挂在右上角的导航，最稳妥的方案是：**Milkdown (内容) + Tocbot (逻辑) + Tailwind v4 (布局)**。

以下是完整的实现流程：

---

### 1. 安装依赖

首先，安装 `tocbot` 及其类型定义：

```bash
pnpm add tocbot

```


### 2. 布局结构 (React 示例)

在你的主页面中，使用 Tailwind v4 的 Flex 布局将编辑器和导航栏分开。

```tsx
<div className="w-full h-full flex flex-col overflow-hidden relative">
    <Toolbar />
    <div className="flex-1 overflow-hidden relative">
    <main className="h-full overflow-y-auto scroll-smooth">
        {/* 1. 外层不设 max-w，宽度 100% */}
        <div className="w-full relative py-10 px-8 flex justify-center">
        {/* 2. 内容主体：通过 w-[800px] 锁死内容宽度 */}
        <div className="w-full max-w-240 shrink-0 prose-custom">
            <Milkdown />
            <div className="h-[10vh]" />
        </div>

        {/* 3. 目录：它会一直“粘”在 800px 内容的右边 */}
        <aside className="hidden xl:block w-64 ml-12 shrink-0 relative">
            <div className="sticky top-10 border-l border-gray-200 pl-4">
            <div className="text-sm font-bold uppercase tracking-wider mb-4 text-gray-500">目录</div>
            <div className="js-toc text-sm"></div>
            </div>
        </aside>
        </div>
    </main>
    </div>
</div>
```


### 3. 配置 Milkdown 监听器与 Tocbot 初始化

由于 Milkdown 的内容是动态生成的，我们需要在内容变化时让 Tocbot “刷新”一下。

```jsx
import * as tocbot from 'tocbot';

useEffect(() => {
    // 1. 初始化 Tocbot
    tocbot.init({
        tocSelector: '.js-toc', // 导航渲染位置
        contentSelector: '.prose-custom', // 标题提取来源 (你的 Milkdown 容器类名)
        headingSelector: 'h2, h3, h4', // 提取二级和三级标题
        // 关键配置
        linkClass: 'toc-link', // 统一类名
        activeLinkClass: 'is-active-link', // 激活类名
        listClass: 'toc-list', // 列表类名
        scrollSmooth: true, // 顺滑滚动
        headingsOffset: 80, // 修正点击跳转后标题被顶栏挡住的问题
        scrollElement: undefined, // 默认是 window
    });
}, [])

useEditor((root) =>
    Editor.make()
      .config((ctx) => {
        ctx.get(listenerCtx).selectionUpdated((ctx) => {
          requestAnimationFrame(() => {
            // ..
            setTimeout(() => tocbot.refresh(), 100);
          });
        });
      })
     // ...
  );
```

### 4. 样式美化 (Tailwind v4 CSS)

Tocbot 生成的是嵌套的 `<a>` 标签。我们需要在 `index.css` 中给它加上高亮样式（VitePress 风格）：

```css
/* 目录容器基础样式 */
.js-toc {
  @apply relative;
}

/* 所有的链接通用样式 */
.toc-link {
  @apply block py-1 no-underline transition-all duration-200 text-gray-500 hover:text-blue-500;
  font-size: 0.875rem;
}

/* --- 核心：缩进分层 --- */

/* 二级标题 (H2) - 靠左 */
.node-name--H2 {
  @apply font-medium;
}

/* 三级标题 (H3) - 缩进，且字体变细 */
.node-name--H3 {
  @apply pl-4 text-[0.8rem] text-gray-400;
}

/* --- 状态：当前选中的标题 --- */

/* 当链接被激活时（滚动到对应位置） */
.is-active-link {
  @apply text-blue-600 border-blue-600;
}

/* 隐藏 Tocbot 默认可能生成的列表圆点 */
.toc-list {
  @apply list-none p-0 m-0;
}
```


### 5. 流程总结

1. **用户输入**：你在 Milkdown 中输入 `## 标题`。
2. **监听触发**：`listener` 插件捕捉到文档更新。
3. **Tocbot 刷新**：`tocbot.refresh()` 被调用，扫描新的 `h2/h3`。
4. **UI 更新**：右侧 `aside` 自动生成点击跳转链接。
5. **滚动追踪**：当你向下滚动查看内容时，Tocbot 利用 `IntersectionObserver` 自动给右侧对应的链接加上 `.is-active-link` 类名，实现高亮跟随。

**需要我帮你针对移动端做一个“点击目录图标弹出抽屉”的适配建议吗？**