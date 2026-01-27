import '@/assets/style/public.css';
import { defaultValueCtx, Editor, rootCtx } from '@milkdown/kit/core';
import { commonmark } from '@milkdown/kit/preset/commonmark';
import { gfm } from '@milkdown/kit/preset/gfm'
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { nord } from '@milkdown/theme-nord';
import Toolbar from '@/compnents/toolbar';
import { useSelectedFmt } from '@/store/useSeletedFmt';
import computeSelectedFmt from '@/utils/compute-selected-fmt';

function MilkdownEditor() {
  const { get } = useEditor((root) =>
    Editor.make()
      .config(nord)
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, '在**这里**开始*写*作，`var a = 123` 啊吧[百度](https://baidu.com)吧吧~~这是被划掉的内容~~...');
        ctx.get(listenerCtx).selectionUpdated((ctx) => {
          requestAnimationFrame(() => {
            const result = computeSelectedFmt(ctx);
            // 批量更新 Zustand 状态(注意：这里用 getState() 直接调用，不会触发组件渲染，性能极高)
            useSelectedFmt.getState().setFmts(result);
          });
        });
      })
      .use(commonmark)
      .use(listener)
      .use(gfm),
  );

  return (
    <div className="w-full h-full">
      <Toolbar />
      <div className="p-2">
        <Milkdown />
      </div>
    </div>
  );
}

export default function MilkdownEditorWrapper() {
  return (
    <MilkdownProvider>
      <MilkdownEditor />
    </MilkdownProvider>
  );
}
