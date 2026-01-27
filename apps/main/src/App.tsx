import '@/assets/style/public.css';
import { tableBlock } from '@milkdown/kit/component/table-block';
import { defaultValueCtx, Editor, rootCtx } from '@milkdown/kit/core';
import { cursor } from '@milkdown/kit/plugin/cursor';
import { codeBlockSchema, commonmark } from '@milkdown/kit/preset/commonmark';
import { gfm } from '@milkdown/kit/preset/gfm';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import trailingParagraph from '@repo/milkdown-plugin/trailing-paragraph.ts';
import { useEffect, useRef } from 'react';
import * as tocbot from 'tocbot';
import Toolbar from '@/compnents/toolbar';
import { useSelectedFmt } from '@/store/useSeletedFmt';
import { highlight, highlightPluginConfig, parser } from '@/utils/code-helight-helper';
import computeSelectedFmt from '@/utils/compute-selected-fmt';
import { mdInitContent } from './utils/mock-data';

function MilkdownEditor() {
  const mainRef = useRef(null);
  useEffect(() => {
    console.log(8989, mainRef.current);
    if (!mainRef.current) return;
    // 1. 初始化 Tocbot
    tocbot.init({
      // decodeEntities: true,
      tocSelector: '.js-toc', // 导航渲染位置
      contentSelector: '.prose-custom', // 标题提取来源 (你的 Milkdown 容器类名)
      headingSelector: 'h2, h3, h4', // 提取二级和三级标题
      // 关键配置
      // linkClass: 'toc-link', // 统一类名
      // activeLinkClass: 'is-active-link', // 激活类名
      // listClass: 'toc-list', // 列表类名
      scrollSmooth: true, // 顺滑滚动
      headingsOffset: 10, // 修正点击跳转后标题被顶栏挡住的问题
      scrollElement: mainRef.current, // 默认是 window
      hasInnerContainers: true, // 如果标题在嵌套容器里，开启此项
    });
    return () => tocbot.destroy(); // 组件卸载记得销毁
  }, []);

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
            console.log(8989);
            
            setTimeout(() => tocbot.refresh(), 100);
          });
        });
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
    <div className="w-full h-full flex flex-col overflow-hidden relative">
      <Toolbar />
      <div className="flex-1 overflow-hidden relative">
        <main className="h-full overflow-y-auto scroll-smooth" ref={mainRef}>
          {/* 1. 外层不设 max-w，宽度 100% */}
          <div className="w-full relative py-10 px-8 flex justify-center">
            {/* 2. 内容主体：通过 w-[800px] 锁死内容宽度 */}
            <div className="w-full max-w-240 shrink-0 prose-custom">
              <Milkdown />
              <div className="h-[10vh]" />
            </div>

            {/* 3. 目录：它会一直“粘”在 800px 内容的右边 */}
            <aside className="hidden xl:block w-64 ml-12 shrink-0 relative">
              <div className="sticky top-10 border-l border-gray-200 pl-4">
                <div className="text-sm font-bold uppercase tracking-wider mb-4 text-gray-500">目录</div>
                <div className="js-toc text-sm"></div>
              </div>
            </aside>
          </div>
        </main>
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
