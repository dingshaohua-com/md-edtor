import '@repo/toc-menu/style.css';
import { TocMenu } from '@repo/toc-menu';

export default function useTocMenu() {
  
  return {
    init: (root: Element, targetElement:Element)=>{
      const tocMenu = new TocMenu({root, targetElement});
      return tocMenu;
    }
  };
}
