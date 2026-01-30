import neotoc from '@repo/neotoc';
import '@repo/neotoc/base-modern.css';
import '@repo/neotoc/colors-zinc.css';

// 提取统一配置，方便维护
const DEFAULT_CONFIG = {
  io: '.milkdown .editor >> h2,h3,h4',
  title: '目录',
  initialFoldLevel: 3,
  offsetTop: 80,
  ellipsis: true,
};

let neotocIns: any;
const init = (tocNode: HTMLElement) => {
  neotocIns = neotoc({
    ...DEFAULT_CONFIG,
    to: tocNode,
  });
};

const refresh = () => {
  console.log('执行刷新');
 neotocIns.refresh()
};

export default { init, refresh };
