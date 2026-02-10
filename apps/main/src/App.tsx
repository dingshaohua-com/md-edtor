import '@/assets/style/public.css';
import 'toc-nav/style.css';
import { tableBlock } from '@milkdown/kit/component/table-block';
import { defaultValueCtx, Editor, editorViewOptionsCtx, rootCtx } from '@milkdown/kit/core';
import type { Ctx } from '@milkdown/kit/ctx';
import { cursor } from '@milkdown/kit/plugin/cursor';
import { codeBlockSchema, commonmark } from '@milkdown/kit/preset/commonmark';
import { gfm } from '@milkdown/kit/preset/gfm';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import clickableLink from '@repo/milkdown-plugin/clickable-link.ts';
import { githubAlert } from '@repo/milkdown-plugin/github-alert.ts';
import inlineLinkInput from '@repo/milkdown-plugin/inline-link-input.ts';
import trailingParagraph from '@repo/milkdown-plugin/trailing-paragraph.ts';
import { useRef } from 'react';
import { TocNav } from 'toc-nav';
import Toolbar from '@/compnents/toolbar';
import { useSelectedFmt } from '@/store/useSeletedFmt';
import { highlight, highlightPluginConfig, parser } from '@/utils/code-helight-helper';
import computeSelectedFmt from '@/utils/compute-selected-fmt';
import { mdInitContent } from './utils/mock-data';

const customCodeBlockSchema = codeBlockSchema.extendSchema((prev) => (ctx) => ({
  ...prev(ctx),
  createGapCursor: true,
}));

function MilkdownEditor() {
  const scrollRef = useRef<HTMLElement>(null);
  const tocRef = useRef<HTMLElement>(null);
  const tocMenu = useRef<TocNav>(null);
  const milkdownEvents = {
    onMounted(ctx: Ctx) {
      tocMenu.current = new TocNav({ contentElement: scrollRef.current!, tocElement: tocRef.current!, useHash: true });
    },
    onUpdated(ctx: Ctx) {
      tocMenu.current?.refresh();
      // 文档变更时（如点击加粗/斜体等）也刷新格式状态，否则工具栏不会立即高亮
      requestAnimationFrame(() => {
        const result = computeSelectedFmt(ctx);
        useSelectedFmt.getState().setFmts(result);
      });
    },
    onSelectionUpdated(ctx: Ctx) {
      // ctx, doc, prevDoc
      requestAnimationFrame(() => {
        const result = computeSelectedFmt(ctx);
        // 批量更新 Zustand 状态(注意：这里用 getState() 直接调用，不会触发组件渲染，性能极高)
        useSelectedFmt.getState().setFmts(result);
        // tocbot.refresh()
      });
    },
  };

  useEditor((root) =>
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, mdInitContent);
        ctx.set(highlightPluginConfig.key, { parser });
        // ctx.set(editorViewOptionsCtx, { editable: () => false });
        ctx.get(listenerCtx).mounted(milkdownEvents.onMounted);
        ctx.get(listenerCtx).selectionUpdated(milkdownEvents.onSelectionUpdated);
        ctx.get(listenerCtx).updated(milkdownEvents.onUpdated);
      })
      .use(githubAlert)
      .use(commonmark)
      .use(customCodeBlockSchema)
      .use(gfm)
      .use(listener)
      .use(highlight)
      .use(cursor)
      .use(tableBlock)
      .use(inlineLinkInput)
      .use(trailingParagraph)
      .use(clickableLink),
  );

  return (
    <div className="milkdown-editor w-full h-full flex flex-col">
      <Toolbar />
      <div className="prose-custom flex-1 min-h-0 border-amber-200 border-2 flex overflow-auto justify-center relative" ref={scrollRef}>
        <main className="flex-1 min-h-0 max-w-220 px-2">
          <Milkdown />
        </main>
        <aside className="text-sm w-60 sticky top-10 h-fit" ref={tocRef} />
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
    <div className="w-100vh max-w-270 h-200 border-red-300 border-2 m-auto mt-10">
      <MilkdownEditorWrapper />
    </div>
  );
}
