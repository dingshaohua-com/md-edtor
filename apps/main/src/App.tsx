import './App.css';
import { Editor, rootCtx } from '@milkdown/kit/core';
import { commonmark } from '@milkdown/kit/preset/commonmark';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { nord } from '@milkdown/theme-nord';
import Toolbar from '@/compnents/toolbar';

function MilkdownEditor() {
  const { get } = useEditor((root) =>
    Editor.make()
      .config(nord)
      .config((ctx) => {
        ctx.set(rootCtx, root);
        // root 其实就是那个挂载的 DOM 节点
        // if (root instanceof HTMLElement) {
        //   root.classList.add('m-x-2');
        // }
      })
      .use(commonmark),
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
