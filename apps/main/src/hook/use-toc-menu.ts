import { type RefObject, useEffect } from 'react';

// 记得引入新文档提到的基础样式和配色:既然你用 Tailwind，Zinc 可能最搭
import '@repo/toc-menu/style.css';
import { TocMenu } from '@repo/toc-menu';

export default function useTocMenu(tocRef: RefObject<HTMLElement | null>) {
  const tocMenu = new TocMenu({ offsetTop: 80 });

  // useEffect(() => {
  //   if (tocRef.current) tocMenu.init(tocRef.current);
  //   return () => tocMenu.destroy();
  // }, [tocRef, tocMenu.destroy, tocMenu.init]);

  return tocMenu;

  // // 在 Milkdown listener 里的 updated 调用
  // tocMenu.refresh();
}
