---
name: milkdown-plugin-dev
description: Develop custom plugins for the Milkdown v7 editor. Trigger when the user asks to create, modify, or debug Milkdown plugins, custom nodes/marks, remark plugins, ProseMirror extensions, input rules, or keymaps. Covers $node, $nodeSchema, $remark, $view, $prose, $command, $inputRule APIs.
---

# Milkdown v7 Plugin Development Guide

## Project Structure

```
md-edtor/                         # pnpm monorepo
├── apps/main/src/App.tsx         # Editor entry, registers all plugins
├── packages/milkdown-plugin/     # Custom plugin directory
│   ├── package.json              # Depends on @milkdown/kit ^7.18.0
│   ├── trailing-paragraph.ts     # Example: $prose plugin
│   ├── github-alert.ts           # Example: full custom node plugin
│   └── github-alert.css          # Plugin styles (co-located with logic)
└── apps/main/src/assets/style/
    └── public.css                # Imports all stylesheets via @import
```

## Plugin Registration

```typescript
// apps/main/src/App.tsx
import { myPlugin } from '@repo/milkdown-plugin/my-plugin.ts';

useEditor((root) =>
  Editor.make()
    .config((ctx) => { /* ... */ })
    .use(myPlugin)        // single plugin or MilkdownPlugin[] array
    .use(commonmark)
    .use(gfm)
    // ...
);
```

## Core API Reference

All APIs are imported from `@milkdown/kit/utils`.

### `$nodeSchema(id, schemaFactory)` — Custom Node (Recommended)

Returns a `$NodeSchema<T>` tuple `[schemaCtx, $Node]`. Spread when composing: `...mySchema`.

```typescript
import { $nodeSchema, $nodeAttr } from '@milkdown/kit/utils'

export const myAttr = $nodeAttr('my_node')

export const mySchema = $nodeSchema('my_node', (ctx) => ({
  // --- ProseMirror NodeSpec ---
  content: 'block+',          // 'inline*' | 'block+' | 'text*' etc.
  group: 'block',             // 'block' | 'inline'
  defining: true,
  attrs: { level: { default: 1 } },

  // HTML → ProseMirror (paste/drag)
  parseDOM: [{ tag: 'div[data-my]', getAttrs: (dom) => ({ level: +(dom as HTMLElement).dataset.my! }) }],

  // ProseMirror → HTML (editor rendering)
  // 0 marks the content hole where child nodes are rendered
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

#### Parser State Methods (parseMarkdown.runner)

| Method | Description |
|--------|-------------|
| `state.openNode(type, attrs?)` | Begin building a node |
| `state.next(children)` | Recursively process child nodes |
| `state.closeNode()` | Close the current node |
| `state.addText(text)` | Add a text node |

#### Serializer State Methods (toMarkdown.runner)

| Method | Description |
|--------|-------------|
| `state.openNode(type, value?, props?)` | Open a node in the mdast |
| `state.addNode(type, children?, value?, props?)` | Add a leaf node |
| `state.next(content)` | Serialize a ProseMirror Fragment |
| `state.closeNode()` | Close the current node |
| `state.withMark(mark, type, value?, props?)` | Handle a mark |

### `$remark(id, remarkFactory, initialOptions?)` — Register Remark Plugin

Returns a tuple `[optionsCtx, plugin]` for transforming the mdast during the parse phase.

```typescript
import type { RemarkPluginRaw } from '@milkdown/kit/transformer'
import { $remark } from '@milkdown/kit/utils'

function myRemarkPlugin() {
  return (tree: any) => { /* traverse and modify mdast */ }
}

export const myRemark = $remark(
  'myRemarkPlugin',
  () => myRemarkPlugin as unknown as RemarkPluginRaw<unknown>,
)
```

> **Type note**: The remark plugin tree parameter expects `Root`, but Milkdown's `MarkdownNode` is not fully compatible. Use `as unknown as RemarkPluginRaw<unknown>` cast.

### `$prose(factory)` — Register Native ProseMirror Plugin

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

### `$view(nodeOrMark, viewFactory)` — Custom NodeView

```typescript
import { $view } from '@milkdown/kit/utils'

const myView = $view(mySchema.node, (ctx) => {
  return (node, view, getPos) => ({
    dom: document.createElement('div'),
    contentDOM: document.createElement('div'),
    update: (updatedNode) => { /* ... */ return true },
    destroy: () => { /* cleanup */ },
  })
})
```

### `$inputRule(factory)` — Input Rules

```typescript
import { wrappingInputRule } from '@milkdown/kit/prose/inputrules'
import { $inputRule } from '@milkdown/kit/utils'

const myInputRule = $inputRule((ctx) =>
  wrappingInputRule(/^\s*>\s$/, mySchema.type(ctx))
)
```

### `$command(name, factory)` — Editor Commands

```typescript
import { wrapIn } from '@milkdown/kit/prose/commands'
import { $command } from '@milkdown/kit/utils'

const myCommand = $command('MyCommand', (ctx) => () =>
  wrapIn(mySchema.type(ctx))
)
```

### `$useKeymap(name, keymapDef)` — Keyboard Shortcuts

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

## Aggregated Export Pattern

`$remark` and `$nodeSchema` return tuples — spread them with `...`:

```typescript
import type { MilkdownPlugin } from '@milkdown/kit/ctx'

export const myPlugin: MilkdownPlugin[] = [
  ...myRemark,            // tuple: [optionsCtx, plugin]
  myAttr,                 // single plugin
  ...mySchema,            // tuple: [schemaCtx, $Node]
  myInputRule,
  myCommand,
  ...myKeymap,            // tuple: [keymapCtx, shortcuts]
]
```

## Adding CSS Styles

Plugin CSS should live in the same package as the logic (`packages/milkdown-plugin/`) for co-location:

1. Create a CSS file under `packages/milkdown-plugin/` (e.g. `my-plugin.css`)
2. Import it in `apps/main/src/assets/style/public.css` with `@import "@repo/milkdown-plugin/my-plugin.css"`

> The package.json `exports: { "./*": "./*" }` already supports importing any file from the package.

## Full Node Plugin Development Checklist

1. **Need mdast transformation?** → Create a `$remark` plugin
2. **Define node attributes** → `$nodeAttr('name')`
3. **Define node schema** → `$nodeSchema('name', factory)`
   - `parseMarkdown`: mdast → ProseMirror
   - `toMarkdown`: ProseMirror → mdast
   - `toDOM` / `parseDOM`: HTML rendering & parsing
4. **Need custom rendering?** → `$view` to create a NodeView
5. **Input rules** → `$inputRule`
6. **Commands** → `$command`
7. **Keyboard shortcuts** → `$useKeymap`
8. **Aggregated export** → `MilkdownPlugin[]` array
9. **Register** → `.use(myPlugin)` in `App.tsx`
10. **Styles** → CSS file + `@import` in `public.css`

## Reference Examples

- **Simple ProseMirror plugin**: `packages/milkdown-plugin/trailing-paragraph.ts`
- **Full custom node**: `packages/milkdown-plugin/github-alert.ts`
- **Official blockquote impl**: `node_modules/.pnpm/@milkdown+preset-commonmark@7.18.0/node_modules/@milkdown/preset-commonmark/src/node/blockquote.ts`
