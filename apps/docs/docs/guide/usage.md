# 用法
在一开始我们就提到 milkdown支持诸多框架，这里我们就以 react 举例！
## 两种用法
milkdown 提供了两种使用模式：开箱即用的成品套装Crepe版本 和 可以高度自定义的基础内核kit版本。

如果你想1分钟引入使用，那就使用前者，但你想定制化一款你自己的md编辑器 则请使用后者！

我们这里以后者为例！

## 使用示例
```jsx title=App.tsx
import { defaultValueCtx, Editor, rootCtx } from '@milkdown/kit/core';
import { commonmark } from '@milkdown/kit/preset/commonmark';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';

function MilkdownEditor() {
  const { get } = useEditor((root) =>
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, '在**这里**开始写作...');
      })
      .use(commonmark)
  );

  return <Milkdown />;
}

export default function MilkdownEditorWrapper() {
  return (
    <MilkdownProvider>
      <MilkdownEditor />
    </MilkdownProvider>
  );
}
```

启动项目，你会发现页面就一个输入框，这就对了，这这种模式下：诸如 工具栏、浮动菜单、块菜单等 所有的工具都需要你去实现！

不用担心，官方都给了API、再不济也还可以用AI、甚至你还可以参考 Crepe 的实现！