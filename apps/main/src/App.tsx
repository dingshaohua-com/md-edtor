import '@/assets/style/public.css';
import { tableBlock } from '@milkdown/kit/component/table-block';
import { defaultValueCtx, Editor, editorViewOptionsCtx, rootCtx } from '@milkdown/kit/core';
import { cursor } from '@milkdown/kit/plugin/cursor';
import { codeBlockSchema, commonmark } from '@milkdown/kit/preset/commonmark';
import { gfm } from '@milkdown/kit/preset/gfm';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import trailingParagraph from '@repo/milkdown-plugin/trailing-paragraph.ts';
import Toolbar from '@/compnents/toolbar';
import useTocBot from '@/hook/use-tocbot';
import { useSelectedFmt } from '@/store/useSeletedFmt';
import { highlight, highlightPluginConfig, parser } from '@/utils/code-helight-helper';
import computeSelectedFmt from '@/utils/compute-selected-fmt';
import { mdInitContent } from './utils/mock-data';

function MilkdownEditor() {
  const { tocbot } = useTocBot();
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
            // tocbot.refresh()
          });
        });
        ctx.set(editorViewOptionsCtx, { editable: () => false });
      })
      .use(commonmark)
      .use(
        codeBlockSchema.extendSchema((prev) => (ctx) => ({
          ...prev(ctx),
          createGapCursor: true,
        })),
      )
      .use(gfm)
      .use(listener)
      .use(highlight)
      .use(cursor)
      .use(tableBlock)
      .use(trailingParagraph),
  );

  return (
    <div className="milkdown-editor w-full h-full flex flex-col">
      <Toolbar />
      <div className="prose-custom flex-1 min-h-0 border-amber-200 border-2 flex overflow-auto justify-center relative scroll-smooth">
        <main className="flex-1 min-h-0 max-w-220">
          <Milkdown />
        </main>
        <aside className="text-sm w-60 sticky top-10 h-fit ml-12">
          <div className="border-l border-gray-200 pl-4">
            <div className="text-sm font-bold uppercase tracking-wider mb-4 text-gray-500">目录</div>
            <div className="js-toc">我是目录，我不动了</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function MilkdownEditorWrapper() {
  return (
     <MilkdownProvider>
        <MilkdownEditor />
      </MilkdownProvider>
  );
}

export default function Demo() {
  return (
    <div className="w-400 h-200 border-red-300 border-2 m-auto mt-10">
      <MilkdownEditorWrapper />
    </div>
  );
}
