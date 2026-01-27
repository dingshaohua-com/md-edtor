# 美化样式
Milkdown/kit没有样式呢,哪怕使用了theme-nord，展示还是裸着的！

其实nord完全可以移除。既然你已经发现它并不能直接提供你想要的视觉效果，那它在你目前的架构中确实成了“冗余代码”。

移除 `theme-nord` 会让你的项目更纯净，也能让你更清晰地掌控每一像素的样式。


## 漂亮点

在 Milkdown v7 的 **Headless（无头）** 架构中，`theme-nord` 的作用被极度压缩了。它的角色已经从“全套皮肤”退化成了“配置中心”：

* **只提供变量：** 它只是定义了一组诸如 `$nord0: #2e3440` 的变量。如果你不用这些变量去写 CSS，它们就是死代码。
* **不强制美化：** 它不会主动给你的 `<h1>` 加字号，也不会给 `<code>` 加背景。
* **增加负担：** 它会往 DOM 里注入一层额外的 `data-theme="nord"` 属性，这在你直接用 Tailwind 开发时几乎没意义。


## 移除它后如何实现“漂亮”？

既然你已经习惯了 Tailwind，移除 `nord` 后，建议你采用 **“Tailwind + Prose”** 的组合。这才是现代编辑器开发的“金标准”。

### 第一步：清理代码

从你的 `Editor.make()` 中移除 `.config(nord)`，并卸载相关包。

### 第二步：利用 Tailwind 快速找回样式

在包裹 `<Milkdown />` 的容器上直接施加样式。直接套用 Tailwind 的 `prose`插件：

```tsx
<div className="prose">
  <Milkdown />
</div>
```

## 更漂亮点
因为 typography 主打报纸排版，所以很多风格都不合适现代，所以我们要做出调整
```css
@plugin "@tailwindcss/typography";

/* typography主打报纸排版，所以很多风格都不合适现代 */
@layer components {
  .prose-custom {
    /* 0. 先把基础的排版骨架“继承”过来 */
    @apply prose max-w-none;

    /* 1. 基础文字：语雀偏好深灰色而非纯黑 */
    @apply text-gray-700 leading-7;

    /* 2. 链接：语雀标志性的蓝色 */
    @apply prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-500;

    /* 3. 行内代码：淡灰色底，无反引号 */
    @apply prose-code:before:content-none prose-code:after:content-none;
    /* @apply prose-code:bg-[#f2f2f2] prose-code:text-[#ff4d4f] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-sm prose-code:mx-1 prose-code:font-normal; */

    /* 4. 引用块：语雀最经典的左侧粗线 */
    @apply prose-blockquote:border-l-[3px] prose-blockquote:border-[#e8e8e8] prose-blockquote:pl-4 prose-blockquote:text-[#8c8c8c] prose-blockquote:not-italic;

    /* 5. 标题：语雀的标题间距比较紧凑 */
    @apply prose-h1:text-[28px] prose-h1:font-semibold prose-h1:mt-8 prose-h1:mb-4;
    @apply prose-h2:text-[24px] prose-h2:font-semibold prose-h2:mt-6 prose-h2:mb-3;

    /* 6. 分割线 */
    @apply prose-hr:border-[#e8e8e8] prose-hr:my-8;

    /* 仅针对【行内代码】定制样式 (排除在 pre 内部的 code) */
    :not(pre) > code {
      @apply bg-slate-100 text-pink-500 rounded px-1.5 py-0.5 mx-0.5;
      @apply font-mono text-[0.9em] border border-slate-200 font-normal;
      /* 加上淡淡的边框和缩放，会更有质感 */
    }
  }
}
```

然后组件使用
```tsx
<div className="prose-custom">
  <Milkdown />
</div>
```