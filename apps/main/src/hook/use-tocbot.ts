import neotoc from 'neotoc';
import { type RefObject, useEffect } from 'react';

// 记得引入新文档提到的基础样式和配色
// import "neotoc/dist/base-modern.css";
// import "neotoc/dist/colors-zinc.css"; // 既然你用 Tailwind，Zinc 可能最搭

export default function tocMenu(tocRef: (RefObject<HTMLElement|null>)) {
  useEffect(() => {
    let cleanup: any;
    if (tocRef?.current) {
      // 调用 neotoc 并传入参数
      cleanup = neotoc({
        // 1. io: 这里的 .milkdown 对应编辑器的容器类名
        // 2. h2,h3,h4: 你想抓取的标题等级
        // 3. tocRef.current: 直接传 DOM 节点（对应文档中提到的 to 选项）
        io: '.prose-custom >> h2,h3,h4',
        to: tocRef.current,
        title: '目录',
        initialFoldLevel: 3, // 默认折叠级别
        offsetTop: 80, // 如果你有固定 Header，记得设置这个
        ellipsis: true, // 标题过长自动省略
      });
    }

    // 直接返回 cleanup 函数，React 卸载时会自动执行销毁逻辑
    return cleanup;
  }, [tocRef]);
}
