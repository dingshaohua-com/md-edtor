# 格式化

## 监听光标区域
```jsx
import { strongSchema } from '@milkdown/kit/preset/commonmark';
import { listener, listenerCtx } from '@milkdown/plugin-listener';

useEditor((root) =>
  Editor.make()
    // ...
    .config((ctx) => {
      // ...
      ctx.get(listenerCtx).selectionUpdated((ctx) => {
        // 1. 获取 View 实例
        const view = ctx.get(editorViewCtx);
        const { state } = view;
        const { from, to, empty } = state.selection;

        // 2. 获取 Mark 类型（例如加粗）
        const boldType = strongSchema.type(ctx);

        // 3. 执行判断（逻辑和你之前的一致）
        const isBold = empty ? !!boldType.isInSet(state.storedMarks || state.selection.$from.marks()) : state.doc.rangeHasMark(from, to, boldType);

        console.log('Bold is active:', isBold);
      });
    })
    .use(listener)
    // ...
  );
```

这段代码的核心逻辑是利用 Milkdown 的 **Listener 插件** 实时监听编辑器的 **选区变化（Selection Update）**，并判断当前光标所在位置或选中的文字是否应用了特定的 **Mark（标记，此处以加粗为例）**。


在开发富文本编辑器时，你通常需要让 UI 保持同步。例如：

1. 用户把光标移到了一段**加粗文字**中间。
2. 代码触发 `selectionUpdated`。
3. 逻辑计算出 `isBold` 为 `true`。
4. **结果：** 你可以用这个 `isBold` 去更新你自定义 React/Vue 组件的状态，让工具栏上的 **B** 按钮亮起来。



### 监听选区更新

```javascript
ctx.get(listenerCtx).selectionUpdated((ctx) => { ... })
```

* `listenerCtx`: 这是来自 `@milkdown/plugin-listener` 的上下文。
* `selectionUpdated`: 只要用户点击、移动光标或拖拽选中文字，这个回调就会被触发。

### 获取视图与状态 (View & State)

```javascript
const view = ctx.get(editorViewCtx);
const { state } = view;
const { from, to, empty } = state.selection;
```

* `editorViewCtx`: 获取 ProseMirror 的 View 实例（Milkdown 基于 ProseMirror）。
* `state.selection`: 获取当前的选区信息。
* `from / to`: 选区的起始和结束位置。
* `empty`: 布尔值。如果为 `true`，表示只是光标闪烁，没有选中文字；如果为 `false`，表示选中了一段文本。



### 获取 Schema 类型

```javascript
const boldType = strongSchema.type(ctx);
```

* 通过 `strongSchema` 获取当前编辑器中定义的“加粗”类型。这让代码知道我们要去查找哪种标记。

### 状态判断逻辑（最关键部分）

```javascript
const isBold = empty 
  ? !!boldType.isInSet(state.storedMarks || state.selection.$from.marks()) 
  : state.doc.rangeHasMark(from, to, boldType);
```

这里使用了**三元运算符**处理两种场景：

* **场景 A：光标模式 (`empty` 为 true)**
* 此时没有选中文字，我们需要判断“接下来的输入是否会加粗”。
* `state.storedMarks`: 检查用户是否刚点击了加粗按钮但还没打字。
* `state.selection.$from.marks()`: 检查当前光标所在位置已有的样式。


* **场景 B：选中范围模式 (`empty` 为 false)**
* `state.doc.rangeHasMark(from, to, boldType)`: 检查从 `from` 到 `to` 这个范围内是否存在加粗样式。


## GFM
Milkdown 的核心设计原则是**“按需加载”和“遵循标准”**。

在 preset-commonmark(核心包) 里的 Schema 确实只涵盖了 Markdown 之父 John Gruber 最初定义的那些最基础、最没有争议的语法。它的目标是“最小通用集”。只包含标题、引用、列表、代码块、加粗、斜体和链接。如果你想要更丰富的支持，请查阅GFM (扩展包)， 也就是 @milkdown/preset-gfm。如果你发现没有删除线 (Strikethrough)、任务列表 (Task list)、表格 (Table) 或者脚注 (Footnote)，是因为这些属于 GitHub 扩展规范。