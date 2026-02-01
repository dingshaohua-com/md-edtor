import '@repo/toc-menu/style.css';
import { TocMenu } from '@repo/toc-menu';
import { useEffect } from 'react';

export default function useTocMenu() {
  return {
    init: (contentElement: Element, tocElement: Element) => {
      const tocMenu = new TocMenu({ contentElement, tocElement, useHash: true });
      return tocMenu;
    },
  };
}
