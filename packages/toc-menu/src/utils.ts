import type { TocItem } from './type';

/**
 * 获取url中的锚点信息
 * @returns
 */
export const getHash = () => {
  const { hash } = window.location;
  let decodedHash = '';
  if (hash) {
    const id = decodeURIComponent(hash.substring(1));
    decodedHash = decodeURIComponent(id);
  }
  return decodedHash;
};

/**
 * 渲染目录 DOM
 * @param tocElement
 * @param tocData
 * @param onClick
 */
export const renderTocHelper = (activeId: string, tocElement: HTMLElement, tocData: TocItem[], onClick: (id: string) => void) => {
  tocElement.innerHTML = `
      <div class="toc-title">目录</div>
      <ul class="toc-list">
        ${tocData
          .map((item) => {
            const isActive = item.id === activeId ? 'active' : '';
            return `<li class="toc-item level-${item.level} ${isActive}" data-id="${item.id}">
            <a href="#${item.id}" data-anchor="${item.id}">${item.text}</a>
          </li>`;
          })
          .join('')}
      </ul>
    `;
  // 2. 绑定事件委托
  const container = tocElement.querySelector('.toc-list');
  container?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    // 确保点击的是 a 标签
    const anchorId = target.getAttribute('data-anchor');

    if (anchorId) {
      e.preventDefault(); // 阻止原生跳转
      // this.handleTocClick(anchorId); // 调用你的处理逻辑
      onClick(anchorId);
    }
  });
};

/**
 * 扫描 Milkdown 里的标题
 * @param contentElement
 * @returns
 */
export const scanHeadings = (contentElement: HTMLElement | Document) => {
  const headings = contentElement.querySelectorAll('h2,h3,h4');
  return Array.from(headings).map((h) => ({
    id: h.id || (h.id = `heading-${Math.random().toString(36).slice(2, 7)}`),
    text: h.textContent || '',
    level: parseInt(h.tagName[1], 10),
  }));
};

/**
 *
 * @param container 滚动容器元素
 * @param targetEl 当前要检查的元素
 * @returns
 */
export const checkScrollMove = (container: HTMLElement, targetEl: HTMLElement) => {
  // ---  如果点击目标和当前位置相等，说名不需要执行滚动 (防止原地踏步导致的锁死) ---
  const startTop = container.scrollTop;
  const maxScroll = container.scrollHeight - container.clientHeight;
  const targetTop = Math.max(0, Math.min(targetEl.offsetTop, maxScroll));
  return Math.abs(startTop - targetTop) > 1;
};

/**
 * 检测是否滚动到容器底部
 * @param container
 * @returns
 */
export const checkIsBottom = (container: HTMLElement) => {
  const { scrollTop, scrollHeight, clientHeight } = container;
  return scrollTop + clientHeight >= scrollHeight - 50;
};
