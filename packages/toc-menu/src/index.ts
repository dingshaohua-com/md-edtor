import type { Config, TocItem } from './type';
import { checkIsBottom, checkScrollMove, getHash, renderTocHelper, scanHeadings } from './utils';

export class TocMenu {
  private tocData: TocItem[] = [];
  private config: Config = {
    contentElement: document.body,
    tocElement: document.createElement('DIV'),
    useHash: true,
  };
  private observer!: IntersectionObserver;
  private isManualScrolling = false; // 是否手动滚动

  constructor(config: Config) {
    this.config = { ...this.config, ...config };
    this.tocData = scanHeadings(this.config.contentElement);
    this.renderToc();
    this.initScroll();
    this.initIntersection();
  }

  /**
   * 滚动条需要初始化的操作
   * 可解决针对SPA或异步内容，导致无法正确初始化锚点位置问题
   */
  initScroll() {
    // 在 scroll 事件中保底， 而不是在 Observer 中
    const onScroll = () => {
      const container = this.config.contentElement;
      const onScrollHandler = () => {
        if (this.isManualScrolling) return;
        const isBottom = checkIsBottom(container);
        // 此时不再信任 IntersectionObserver 的“碰线”逻辑：直接把高亮给最后一个
        if (isBottom) this.doHighlight(this.tocData[this.tocData.length - 1].id);
      };
      container.addEventListener('scroll', onScrollHandler, { passive: true });
    };
    // 初始化Hash
    const hash = getHash();
    if (hash) {
      const resizeObserver = new ResizeObserver(() => {
        const element = document.getElementById(hash);
        if (element) {
          this.doHighlight(hash);
          element.scrollIntoView();
          this.config.contentElement.addEventListener('scrollend', onScroll, { once: true });
          resizeObserver.disconnect();
        } else console.error('锚点不存在哦');
      });
      resizeObserver.observe(document.body);
    } else requestAnimationFrame(() => onScroll());
  }

  /**
   * 渲染toc组件，并设置点击事件
   */
  private renderToc(activeId = '') {
    renderTocHelper(activeId, this.config.tocElement, this.tocData, (anchorId: string) => {
      this.handleTocClick(anchorId);
    });
  }

  /**
   * 开始观测所有标题(是否进入可视检测区域)
   */
  private initIntersection() {
    const onObserver = (entries?: IntersectionObserverEntry[]) => {
      if (entries && entries.length > 0 && !this.isManualScrolling) {
        const intersectingEntries = entries.filter((entry) => entry.isIntersecting);
        if (intersectingEntries.length > 0) {
          const targetId = intersectingEntries[intersectingEntries.length - 1].target.id;
          this.doHighlight(targetId);
        }
      }
    };
    this.observer = new IntersectionObserver(onObserver, {
      root: this.config.contentElement,
      rootMargin: '0px 0px -90% 0px', // 根元素的外边距
      // threshold: Array.from({ length: 10 }, (_, i) => i * 0.1),
    });
    this.tocData.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) this.observer?.observe(el);
    });
  }

  /**
   *
   * 锚点点击事件
   * 注意：手动滚动的时候要求点击后即可高亮，此时IntersectionObserver应放弃onObserver
   * 所以我们定义了isManualScrolling来锁它这个操作
   */
  private handleTocClick(anchorId: string) {
    this.isManualScrolling = true;
    this.doHighlight(anchorId);
    const targetEl = document.getElementById(decodeURIComponent(anchorId));
    const container = this.config.contentElement;

    if (targetEl) {
      history.pushState(null, '', `#${anchorId}`);
      // ---  如果点击目标和当前位置相等，说名不需要执行滚动 (防止原地踏步导致的锁死) ---
      const isMove = checkScrollMove(container, targetEl);
      if (!isMove) return (this.isManualScrolling = false);

      // --- 否则才滚动 ---
      targetEl.scrollIntoView({ behavior: 'smooth' });
      container.addEventListener('scrollend', () => (this.isManualScrolling = false), { once: true });
    }
  }

  /**
   * 锚点高亮逻辑：操作 CSS 类
   * @param id
   * @returns
   */
  private doHighlight(id: string) {
    const target = this.config.tocElement;
    if (!target) return;
    const items = target.querySelectorAll('.toc-item');
    items.forEach((el) => {
      el.classList.toggle('active', el.getAttribute('data-id') === id);
    });
  }

  /**
   * 刷新 TOC 状态
   * 适用于编辑器内容变更、异步数据加载等场景
   */
  public refresh() {
    // 1. 停止之前的观测，防止内存泄漏和冗余回调
    this.observer?.disconnect();
    // 2. 重新扫描最新的标题数据
    this.tocData = scanHeadings(this.config.contentElement);
    // 3. 重新渲染 TOC 菜单 UI
    this.renderToc();
    // 4. 重新初始化 IntersectionObserver 监听最新的 DOM 节点
    this.tocData.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) this.observer?.observe(el);
    });
    // 5. 保底逻辑：如果刷新后页面就在顶部/底部，手动触发一次高亮校准
    const container = this.config.contentElement;
    if (checkIsBottom(container)) this.doHighlight(this.tocData[this.tocData.length - 1]?.id);
  }
}
