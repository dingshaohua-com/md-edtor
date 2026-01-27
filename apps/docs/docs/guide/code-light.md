# 代码高亮

确实，官网那个文档属于“跳跃式”文档，直接假设你已经知道所有依赖包的名字了。

要跑通你看到的那个官网示例（以最平衡的 **Lowlight** 为例），你需要安装以下三个核心包：

### 1. 必装依赖清单

在你的项目根目录下执行：

```bash
pnpm add @milkdown/plugin-highlight lowlight highlight.js

```

* **`@milkdown/plugin-highlight`**: Milkdown 的高亮插件本体，负责把高亮逻辑注入编辑器。
* **`lowlight`**: 高亮解析引擎，它把代码文本变成抽象语法树（AST）。
* **`highlight.js`**: 提供具体的语言定义和样式支持（lowlight 依赖它来解析语法）。

---

### 2. 为什么还要装 `highlight.js`？

官网给的 `import 'highlight.js/styles/default.css'` 这一行，如果你不安装 `highlight.js`，你的 Vite 或 Webpack 直接就会报 **Module not found**。

虽然我们用 `lowlight` 来解析，但**皮肤（CSS）和底层语法定义**依然是引用 `highlight.js` 的。

---

### 3. 完整的初始化代码（带包引入）

为了让你不报错，你需要按照这个结构组织代码：

```tsx
// 1. 引入插件和引擎
import { highlight, highlightPluginConfig } from '@milkdown/plugin-highlight';
import { createParser } from '@milkdown/plugin-highlight/lowlight';
import { common, createLowlight } from 'lowlight';

// 2. 引入样式（注意：因为你用了prose，这行引入可能被覆盖，但为了hljs类名必须有它）
import 'highlight.js/styles/github.css'; 

// 3. 准备解析器
const lowlight = createLowlight(common);
const parser = createParser(lowlight);

// 4. 配置 Milkdown
Editor.make()
  .config((ctx) => {
    // 官网那行 ctx.set(highlightPluginConfig.key, { parser }) 就在这里用
    ctx.set(highlightPluginConfig.key, { parser });
  })
  .use(highlight)
  .use(commonmark)

```

---

### 4. 给语雀风格的特别提醒

如果你想完全复刻语雀的代码块感，安装完上面的包后，记得在你之前的 `.prose-yuque` CSS 里加上这一句，强制干掉 `prose` 那个沉闷的黑色背景：

```css
.prose-yuque pre {
  /* 语雀代码块背景是浅灰，不是 prose 默认的黑 */
  @apply bg-[#f7f7f7] border border-[#e8e8e8] !important;
}

.prose-yuque pre code {
  /* 确保文字颜色不是 prose 强制的白色 */
  @apply text-[#262626] !important;
}

```

**既然你已经知道要装什么了，你是想现在就把这些包 add 进去试试效果，还是想让我帮你看看如果你想用更漂亮的 Shiki 引擎（VS Code 同款高亮）需要装哪些包？**