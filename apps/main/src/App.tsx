import '@/assets/style/public.css';
import { defaultValueCtx, Editor, rootCtx } from '@milkdown/kit/core';
import { cursor } from '@milkdown/kit/plugin/cursor'
import { codeBlockSchema, commonmark } from '@milkdown/kit/preset/commonmark';
import { gfm } from '@milkdown/kit/preset/gfm'
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import trailingParagraph from "@repo/milkdown-plugin/trailing-paragraph.ts"
import Toolbar from '@/compnents/toolbar';
import { useSelectedFmt } from '@/store/useSeletedFmt';
import {highlight, highlightPluginConfig, parser} from '@/utils/code-helight-helper'
import computeSelectedFmt from '@/utils/compute-selected-fmt';


// const mdInitContent = `
// ## 你好 
// 在**这里**开始*写*作，\`var a = 123\` 
// 啊吧[百度](https://baidu.com)吧吧~~这是被划掉的内容~~...

// ---

// * 呵呵
// * 哈哈

// [![pZwLWOf.png](https://s41.ax1x.com/2026/01/09/pZwLWOf.png)](https://imgchr.com/i/pZwLWOf)

// \`\`\` js
// var a = 123; 
// \`\`\`
// `
const mdInitContent = `---`
// const mdInitContent = `[![pZwLWOf.png](https://s41.ax1x.com/2026/01/09/pZwLWOf.png)](https://imgchr.com/i/pZwLWOf)`


function MilkdownEditor() {
  const { get } = useEditor((root) =>
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, mdInitContent);
        ctx.set(highlightPluginConfig.key, { parser });
        ctx.get(listenerCtx).selectionUpdated((ctx) => {
          requestAnimationFrame(() => {
            const result = computeSelectedFmt(ctx);
            // 批量更新 Zustand 状态(注意：这里用 getState() 直接调用，不会触发组件渲染，性能极高)
            useSelectedFmt.getState().setFmts(result);
          });
        });
      })
      .use(commonmark)
      .use(codeBlockSchema.extendSchema((prev) => (ctx) => ({
        ...prev(ctx),
        createGapCursor: true,
      })))
      .use(gfm)
      .use(listener)
      .use(highlight)
      .use(cursor)
      .use(trailingParagraph),
  );

  return (
    <div className="w-full h-full">
      <Toolbar />
      <div className="p-2 prose-custom">
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
