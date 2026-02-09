---
name: milkdown-plugin-dev
description: 开发 Milkdown v7 编辑器自定义插件。当用户要求创建、修改或调试 Milkdown 插件、自定义节点/Mark、remark 插件、ProseMirror 扩展、输入规则或快捷键时触发。涵盖 $node、$nodeSchema、$remark、$view、$prose、$command、$inputRule 等 API。
---

# Milkdown v7 插件开发指南

## 项目结构

```
md-edtor/                         # pnpm monorepo
├── apps/main/src/App.tsx         # 编辑器入口，注册所有插件
├── packages/milkdown-plugin/     # 自定义插件目录
│   ├── package.json              # 依赖 @milkdown/kit ^7.18.0
│   ├── trailing-paragraph.ts     # 示例：$prose 插件
│   ├── github-alert.ts           # 示例：完整自定义节点插件
│   └── github-alert.css          # 插件配套样式（与逻辑同包）
└── apps/main/src/assets/style/
    └── public.css                # 通过 @import 引入所有样式
```

## 插件注册方式

```typescript
// apps/main/src/App.tsx
import { myPlugin } from '@repo/milkdown-plugin/my-plugin.ts';

useEditor((root) =>
  Editor.make()
    .config((ctx) => { /* ... */ })
    .use(myPlugin)        // 单插件或 MilkdownPlugin[] 数组
    .use(commonmark)
    .use(gfm)
    // ...
);
```

## 核心 API 速查

所有 API 从 `@milkdown/kit/utils` 导入。

### `$nodeSchema(id, schemaFactory)` — 自定义节点（推荐）

返回 `$NodeSchema<T>` 元组 `[schemaCtx, $Node]`，使用时需展开：`...mySchema`。

```typescript
import { $nodeSchema, $nodeAttr } from '@milkdown/kit/utils'

export const myAttr = $nodeAttr('my_node')

export const mySchema = $nodeSchema('my_node', (ctx) => ({
  // --- ProseMirror NodeSpec ---
  content: 'block+',          // 'inline*' | 'block+' | 'text*' 等
  group: 'block',             // 'block' | 'inline'
  defining: true,
  attrs: { level: { default: 1 } },

  // HTML → ProseMirror（粘贴/拖拽）
  parseDOM: [{ tag: 'div[data-my]', getAttrs: (dom) => ({ level: +(dom as HTMLElement).dataset.my! }) }],

  // ProseMirror → HTML（编辑器渲染）
  // 0 表示子节点渲染位置（content hole）
  toDOM: (node) => ['div', { class: 'my-node', 'data-my': node.attrs.level, ...ctx.get(myAttr.key)(node) }, 0],

  // --- Markdown AST → ProseMirror ---
  parseMarkdown: {
    match: (mdNode) => mdNode.type === 'my_custom_type',
    runner: (state, mdNode, proseType) => {
      state.openNode(proseType, { level: mdNode.level })
      if (mdNode.children) state.next(mdNode.children)
      state.closeNode()
    },
  },

  // --- ProseMirror → Markdown AST ---
  toMarkdown: {
    match: (node) => node.type.name === 'my_node',
    runner: (state, node) => {
      state.openNode('my_mdast_type')
      state.next(node.content)
      state.closeNode()
    },
  },
}))
```

#### Parser State 方法（parseMarkdown.runner）

| 方法 | 说明 |
|------|------|
| `state.openNode(type, attrs?)` | 开始构建节点 |
| `state.next(children)` | 递归处理子节点 |
| `state.closeNode()` | 关闭当前节点 |
| `state.addText(text)` | 添加文本节点 |

#### Serializer State 方法（toMarkdown.runner）

| 方法 | 说明 |
|------|------|
| `state.openNode(type, value?, props?)` | 在 mdast 中打开节点 |
| `state.addNode(type, children?, value?, props?)` | 添加叶子节点 |
| `state.next(content)` | 序列化 ProseMirror Fragment |
| `state.closeNode()` | 关闭当前节点 |
| `state.withMark(mark, type, value?, props?)` | 处理 mark |

### `$remark(id, remarkFactory, initialOptions?)` — 注册 remark 插件

返回元组 `[optionsCtx, plugin]`，用于在 mdast 解析阶段转换 AST。

```typescript
import type { RemarkPluginRaw } from '@milkdown/kit/transformer'
import { $remark } from '@milkdown/kit/utils'

function myRemarkPlugin() {
  return (tree: any) => { /* 遍历并修改 mdast */ }
}

export const myRemark = $remark(
  'myRemarkPlugin',
  () => myRemarkPlugin as unknown as RemarkPluginRaw<unknown>,
)
```

> **类型提示**：remark 插件的 tree 参数类型是 `Root`，但 Milkdown 的 `MarkdownNode` 不完全兼容，通常需要 `as unknown as RemarkPluginRaw<unknown>` 断言。

### `$prose(factory)` — 注册 ProseMirror 原生插件

```typescript
import { schemaCtx } from '@milkdown/kit/core'
import { Plugin, PluginKey } from '@milkdown/kit/prose/state'
import { $prose } from '@milkdown/kit/utils'

const myProse = $prose((ctx) => {
  const schema = ctx.get(schemaCtx)
  return new Plugin({
    key: new PluginKey('my-plugin'),
    appendTransaction(_, __, newState) { /* ... */ },
  })
})
```

### `$view(nodeOrMark, viewFactory)` — 自定义 NodeView

```typescript
import { $view } from '@milkdown/kit/utils'

const myView = $view(mySchema.node, (ctx) => {
  return (node, view, getPos) => ({
    dom: document.createElement('div'),
    contentDOM: document.createElement('div'),
    update: (updatedNode) => { /* ... */ return true },
    destroy: () => { /* 清理 */ },
  })
})
```

### `$inputRule(factory)` — 输入规则

```typescript
import { wrappingInputRule } from '@milkdown/kit/prose/inputrules'
import { $inputRule } from '@milkdown/kit/utils'

const myInputRule = $inputRule((ctx) =>
  wrappingInputRule(/^\s*>\s$/, mySchema.type(ctx))
)
```

### `$command(name, factory)` — 编辑器命令

```typescript
import { wrapIn } from '@milkdown/kit/prose/commands'
import { $command } from '@milkdown/kit/utils'

const myCommand = $command('MyCommand', (ctx) => () =>
  wrapIn(mySchema.type(ctx))
)
```

### `$useKeymap(name, keymapDef)` — 快捷键

```typescript
import { commandsCtx } from '@milkdown/kit/core'
import { $useKeymap } from '@milkdown/kit/utils'

const myKeymap = $useKeymap('myKeymap', {
  MyCommand: {
    shortcuts: 'Mod-Shift-b',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(myCommand.key)
    },
  },
})
```

## 聚合导出模式

`$remark` 和 `$nodeSchema` 返回的都是 tuple，需要用 `...` 展开：

```typescript
import type { MilkdownPlugin } from '@milkdown/kit/ctx'

export const myPlugin: MilkdownPlugin[] = [
  ...myRemark,            // tuple: [optionsCtx, plugin]
  myAttr,                 // 单个插件
  ...mySchema,            // tuple: [schemaCtx, $Node]
  myInputRule,
  myCommand,
  ...myKeymap,            // tuple: [keymapCtx, shortcuts]
]
```

## 添加 CSS 样式

插件的 CSS 应与逻辑放在同一个包内（`packages/milkdown-plugin/`），保持内聚：

1. 在 `packages/milkdown-plugin/` 下创建 CSS 文件（如 `my-plugin.css`）
2. 在 `apps/main/src/assets/style/public.css` 中用 `@import "@repo/milkdown-plugin/my-plugin.css"` 引入

> `package.json` 的 `exports: { "./*": "./*" }` 已支持直接引用包内任意文件。

## 完整节点插件开发清单

1. **需要 remark 转换？** → 创建 `$remark` 插件修改 mdast
2. **定义节点属性** → `$nodeAttr('name')`
3. **定义节点 Schema** → `$nodeSchema('name', factory)`
   - `parseMarkdown`: mdast → ProseMirror
   - `toMarkdown`: ProseMirror → mdast
   - `toDOM` / `parseDOM`: HTML 渲染与解析
4. **需要自定义渲染？** → `$view` 创建 NodeView
5. **输入规则** → `$inputRule`
6. **命令** → `$command`
7. **快捷键** → `$useKeymap`
8. **聚合导出** → `MilkdownPlugin[]` 数组
9. **注册** → `App.tsx` 中 `.use(myPlugin)`
10. **样式** → CSS 文件 + `public.css` 引入

## 参考示例

- **简单 ProseMirror 插件**: `packages/milkdown-plugin/trailing-paragraph.ts`
- **完整自定义节点**: `packages/milkdown-plugin/github-alert.ts`
- **官方 blockquote 实现**: `node_modules/.pnpm/@milkdown+preset-commonmark@7.18.0/node_modules/@milkdown/preset-commonmark/src/node/blockquote.ts`
