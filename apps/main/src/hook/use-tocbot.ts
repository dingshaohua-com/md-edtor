import neotoc from 'neotoc';
import { type RefObject, useEffect } from 'react';

// 记得引入新文档提到的基础样式和配色:既然你用 Tailwind，Zinc 可能最搭
import 'neotoc/base-modern.css';
import 'neotoc/colors-zinc.css';

export default function tocMenu(tocRef: RefObject<HTMLElement | null>) {
  const initNeotoc = () => {
    console.log('初始化');
    // 调用 neotoc 并传入参数
    const cleanup = neotoc({
      io: 'main >> h2,h3,h4', // 这里的 .editor 对应编辑器的容器类名，h2,h3,h4: 你想抓取的标题等级
      to: tocRef.current!, // 直接传 DOM 节点
      title: '目录',
      initialFoldLevel: 3, // 默认折叠级别
      offsetTop: 80, // 如果你有固定 Header，记得设置这个
      ellipsis: true, // 标题过长自动省略
    });

    return cleanup;
  };

  useEffect(() => {
    let cleanup: any;
    if (tocRef?.current) {
      requestAnimationFrame(() => {initNeotoc()});
    }
    // 直接返回 cleanup 函数，React 卸载时会自动执行销毁逻辑
    return cleanup;
  }, [tocRef.current, initNeotoc]);
}
