import { debounce } from 'lodash-es';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export class TocMenu {
  private observer: IntersectionObserver | null = null;
  private container: HTMLElement | null = null;
  private activeId: string | null = null;

  constructor(private options: { offsetTop: number }) {}

  // 1. 扫描 Milkdown 里的标题
  private getTocData(): TocItem[] {
    const headings = document.querySelectorAll('.milkdown .editor h2, .milkdown .editor h3, .milkdown .editor h4');
    return Array.from(headings).map((h) => ({
      id: h.id || (h.id = `heading-${Math.random().toString(36).slice(2, 7)}`), // 确保有 ID
      text: h.textContent || '',
      level: parseInt(h.tagName[1], 10),
    }));
  }

  // 2. 渲染目录 DOM
  private render(items: TocItem[], target: HTMLElement) {
    target.innerHTML = `
      <div class="toc-title">目录</div>
      <ul class="toc-list">
        ${items
          .map(
            (item) => `
          <li class="toc-item level-${item.level}" data-id="${item.id}">
            <a href="#${item.id}">${item.text}</a>
          </li>
        `,
          )
          .join('')}
      </ul>
    `;
  }

  // 3. 核心：启动交叉观测器
  public init(tocContainer: HTMLElement) {
    this.container = tocContainer;
    this.refresh();
  }

  public refresh = debounce(() => {
    if (!this.container) return;
    const items = this.getTocData();
    this.render(items, this.container);

    // 销毁旧观测器
    if (this.observer) this.observer.disconnect();

    // 创建新观测器：监控标题何时进入视口顶部
    this.observer = new IntersectionObserver(
      (entries) => {
        // 找到当前正在视口上方的标题
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) {
          this.highlight(visibleEntry.target.id);
        }
      },
      {
        // rootMargin 的 top 值设为负的 offsetTop，意味着“触发线”在距离顶部 80px 的位置
        rootMargin: `-${this.options.offsetTop}px 0px -80% 0px`,
        threshold: 0,
      },
    );

    // 开始观测所有标题
    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) this.observer?.observe(el);
    });
  }, 300);

  // 4. 高亮逻辑：操作 CSS 类
  private highlight(id: string) {
    if (this.activeId === id) return;
    this.activeId = id;

    // 清除旧高亮
    this.container?.querySelectorAll('.toc-item').forEach((el) => {
      el.classList.remove('active');
    });
    // 添加新高亮
    const activeEl = this.container?.querySelector(`[data-id="${id}"]`);
    activeEl?.classList.add('active');
  }

  public destroy() {
    this.observer?.disconnect();
    this.refresh.cancel();
  }
}
