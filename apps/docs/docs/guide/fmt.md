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


## 判断不准问题
从图片看，光标已经处于“里”字的右侧（也就是在“这”和“里”之间，或者就在加粗区域边缘），但控制台依然打印 `false`。这确实说明**状态获取滞后**了。

之所以“慢一步”，是因为在 ProseMirror 的逻辑中，**点击动作发生时，`selectionUpdated` 触发的时机可能早于 View 状态的最终解析完成**。你拿到的 `state` 还是移动前的那个。



### 解决办法：加入 `requestAnimationFrame`

这是解决 Milkdown/ProseMirror UI 同步问题最有效的方法。通过 `rAF`，我们将获取状态的逻辑推迟到浏览器完成这一帧的选区计算之后。

请修改你的代码如下：

```javascript
ctx.get(listenerCtx).selectionUpdated((ctx) => {
  // 关键：包一层 rAF，确保在下一帧（DOM/选区已就绪）时执行
  requestAnimationFrame(() => {
    const view = ctx.get(editorViewCtx);
    const { state } = view;
    const { from, to, empty } = state.selection;

    const boldType = strongSchema.type(ctx);

    const isBold = empty 
      ? !!boldType.isInSet(state.storedMarks || state.selection.$from.marks()) 
      : state.doc.rangeHasMark(from, to, boldType);
  });
});

```

### 为什么加上这个就准了？

1. **物理位移 vs 逻辑状态**：当你点击鼠标时，系统先感知到“选区变了”，然后通知 Listener。但在那一毫秒，`view.state` 内部的 `selection` 对象可能还在更新中。
2. **强制同步**：`requestAnimationFrame` 会保证你的代码在浏览器下一次重绘前执行，此时 ProseMirror 已经彻底完成了事务（Transaction）的合并，你拿到的 `state.selection` 绝对是光标落点后的真实位置。



## GFM
Milkdown 的核心设计原则是**“按需加载”和“遵循标准”**。

在 preset-commonmark(核心包) 里的 Schema 确实只涵盖了 Markdown 之父 John Gruber 最初定义的那些最基础、最没有争议的语法。它的目标是“最小通用集”。只包含标题、引用、列表、代码块、加粗、斜体和链接。
preset-commonmark 除了 Mark（行内样式），Node（节点）层面的 Input Rules 也提供了基础标准支持。你提供的代码段里已经包含了这些：
```
# -> 标题
> -> 引用
- -> 无序列表
1. -> 有序列表
--- -> 分割线
三个反斜点-> 代码块
```


如果你还是想要更丰富的支持，请查阅GFM (扩展包)， 也就是 @milkdown/preset-gfm。如果你发现没有删除线 (Strikethrough)、任务列表 (Task list)、表格 (Table) 或者脚注 (Footnote)，是因为这些属于 GitHub 扩展规范。
会在上述基础之上增加：
```
删除线 (Strikethrough): ~~text~~
任务列表 (Task List): [ ] 或 [x]
表格 (Table): | col | col |
自动链接: 直接输入 URL 自动转链接。
```

如果你还是觉得不够，那就自己写扩展吧，比如mark或node！

### 下划线
使用gfm后，你md里的下划线语法就生效啦 `~~这是被划掉的内容~~`！

```jsx
import { gfm } from '@milkdown/kit/preset/gfm'

useEditor((root) =>
  Editor.make()
    .use(gfm)
    // ...
)
```