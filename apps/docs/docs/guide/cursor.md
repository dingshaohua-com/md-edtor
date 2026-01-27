# 光标问题

## 没有落脚点

这是一个非常经典的问题，在基于 ProseMirror 的编辑器（如 Milkdown）中，如果文档内没有光标可以落脚的节点（节点性质限制如此，比如 `hr`）时，编辑器就像死了一样，没有反馈！比如你的文档内容只有 `---` 时！

Milkdown 官方为了解决这个问题，专门提供了一个**光标增强插件**，它会在这种情况下增加一个"虚拟落脚点"：

```tsx
import { cursor } from '@milkdown/kit/plugin/cursor'

Editor.make()
  .use(commonmark)
  .use(cursor) // 核心：加入这个插件
  // ... 其他配置
```

在 Milkdown 中，这对应的就是 **`gap cursor`**（间隙光标）。`@milkdown/plugin-cursor` 内部就集成了这种机制，能让你在代码块和文档底部之间看到一条细细的横线，点击它就能直接跳出。

### Gap cursor 的触发条件

Gap cursor 在满足以下任一条件时出现：

- 节点的 `allowGapCursor` 属性为 `true`（显式允许）
- 节点是 **leaf block**（块级叶子节点，如 `hr`）
- 节点的内容表达式不允许直接放置文本光标（比如 `table` 的 content 是 `table_row+`，不是 `inline*`）

> 简单总结：任何块级节点，只要其内部不接受常规文本光标（不含 `inline*` 内容，比如 `image`），其前后都可能出现 gap cursor。这就是为什么 `@milkdown/plugin-cursor` 被推荐为必装插件——它覆盖了所有这些场景。

### 哪些节点不会触发？

- `code_block`：content 是 `text*`，光标可以正常进入内部编辑，所以**不会**触发 gap cursor
- `image`：属于 `inline*` 类型，**不会**触发

### 纯 commonmark 预设下

严格来说，只有 **`hr`** 会触发 gap cursor——它是唯一一个 content 为空（没有任何可编辑内容）的块级 leaf 节点。

如果你额外安装了 `@milkdown/preset-gfm`（表格）或其他插件引入了 `table`、`math_block`、`iframe` 等块级不可直接编辑的节点，那些才会额外触发。

### 注意样式
ProseMirror 是"无头"（headless）编辑器框架 — 它只管逻辑，不管样式。gapcursor 插件做的事是在 DOM 里插入一个 `<div class="ProseMirror-gapcursor">` 元素，但长什么样完全交给你。

即gapcursor也需要样式（横向闪烁那个东西），你可以手动将prosemirror-gapcursor 包自带的标准样式，原样搬过来的。原始文件在 node_modules/prosemirror-gapcursor/style/gapcursor.css：
```css
/* gap cursor 样式：让代码块前后的间隙光标可见 */
.ProseMirror-gapcursor {
  display: none;
  pointer-events: none;
  position: relative;
}

.ProseMirror-gapcursor:after {
  content: "";
  display: block;
  position: absolute;
  top: -2px;
  width: 20px;
  border-top: 1px solid black;
  animation: ProseMirror-cursor-blink 1.1s steps(2, start) infinite;
}

@keyframes ProseMirror-cursor-blink {
  to {
    visibility: hidden;
  }
}

.ProseMirror-focused .ProseMirror-gapcursor {
  display: block;
}
```
如果不想手动复制，也可以直接 import：
```
import 'prosemirror-gapcursor/style/gapcursor.css'
```


## 光标出不去

在 ProseMirror/Milkdown 中，"光标出不去"发生在**光标进入了某个块级容器节点，且该节点位于文档边界（开头或末尾）**时。

### 具体场景

- **Code Block 在文档末尾** — 按 Enter 只会在代码块内换行，光标无法跳到下方（因为下方没有段落节点）
- **Code Block 在文档开头** — 光标无法向上跳出，无法在代码块上方插入内容
- **Blockquote 在文档边界** — 同理，引用块内按 Enter 只会继续引用
- **嵌套列表在文档边界** — 深层列表项内光标难以跳出

### 本质原因

两个条件同时满足：

1. 节点的**键盘行为会捕获 Enter/方向键**（如 `code_block` 把 Enter 当作换行，`blockquote` 把 Enter 当作继续引用）
2. 节点处于**文档边界**，外侧没有可落脚的段落节点

### 与 gap cursor 的区别

| | Gap Cursor | 光标出不去 |
|---|---|---|
| **问题** | 节点本身不可编辑，光标无处落脚（如 `hr`） | 光标能进去，但键盘事件被拦截导致出不来 |
| **解决方式** | `gapcursor` 插件 | 自定义 keymap 或 `cursor` 插件的跳出逻辑 |

### 解决方案

解决办法本质上都是**在节点外侧提供一个光标落脚点**，有两种方案：

#### 方案 A：开启 Gap Cursor

在节点边界显示虚拟光标，用户点击或按方向键即可跳出：

```jsx
const { get } = useEditor((root) =>
  Editor.make()
    .config((ctx) => {
    // ...
    .use(codeBlockSchema.extendSchema((prev) => (ctx) => ({
      ...prev(ctx),
      createGapCursor: true,
    })))
```

#### 方案 B：Trailing Paragraph

强制在文档末尾始终保留一个空段落，确保光标有地方可去：

```tsx
import { schemaCtx } from '@milkdown/kit/core'
import { Plugin, PluginKey } from '@milkdown/kit/prose/state'
import { $prose } from '@milkdown/kit/utils'

/**
 * 保证文档末尾始终有一个空段落，
 * 这样光标就不会被"困"在末尾的代码块（或其他非段落块）里。
 */
export const trailingParagraph = $prose((ctx) => {
  const schema = ctx.get(schemaCtx)

  return new Plugin({
    key: new PluginKey('trailing-paragraph'),
    appendTransaction(_, __, newState) {
      const { doc } = newState
      const lastNode = doc.lastChild

      // 如果文档末尾已经是空段落，就不需要插入
      if (
        lastNode
        && lastNode.type === schema.nodes.paragraph
        && lastNode.childCount === 0
      ) {
        return null
      }

      // 在文档末尾插入一个空段落
      const paragraph = schema.nodes.paragraph.createAndFill()
      if (!paragraph) return null

      return newState.tr.insert(doc.content.size, paragraph)
    },
  })
})
// 在 useEditor 的时候去 use 即可
```

## 两者互补

两者可以互补使用。很多编辑器（如 Notion、语雀）实际上两种都用了：既有 gap cursor 处理 `hr`、`table` 这类不可编辑节点，也有 trailing paragraph 保证文档末尾永远有段落可落脚。
