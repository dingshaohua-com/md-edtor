interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface Options extends IntersectionObserverInit {
  headingsElement?: Element | Document | null;
  targetElement?: Element | null;
}

export class TocMenu {
  private observer: IntersectionObserver | null = null;
  private options: Options = {
    root: null, // 根元素，null表示视口元素
    rootMargin: '0px', // 根元素的外边距
    threshold: 0.5, // 交叉比例的阈值
    headingsElement: null, // 标题容器元素，如果不指定就是root
    targetElement: null, // toc菜单挂载位置
  };

  constructor(_options?: Options) {
    const options = { ...this.options, ..._options };
    if (!options.headingsElement) {
      options.headingsElement = options.root;
    }
    this.options = options;
    this.observer = new IntersectionObserver(this.observerCallback.bind(this), options);
    const tocData = this.getTocData();
    this.renderToc(tocData, this.options.targetElement!);
    // 开始观测所有标题
    tocData.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) this.observer?.observe(el);
    });
  }

  // 扫描 Milkdown 里的标题
  private getTocData(): TocItem[] {
    const headings = this.options.headingsElement?.querySelectorAll('h2,h3,h4') || [];
    return Array.from(headings).map((h) => ({
      id: h.id || (h.id = `heading-${Math.random().toString(36).slice(2, 7)}`), // 确保有 ID
      text: h.textContent || '',
      level: parseInt(h.tagName[1], 10),
    }));
  }

  // 渲染目录 DOM
  private renderToc(items: TocItem[], target: Element) {
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

  // 高亮逻辑：操作 CSS 类
  private doHighlight(id: string) {
    // 清除旧高亮
    this.options.targetElement?.querySelectorAll('.toc-item').forEach((el) => {
      el.classList.remove('active');
    });

    // 添加新高亮
    const activeEl = this.options.targetElement?.querySelector(`[data-id="${id}"]`);
    activeEl?.classList.add('active');
  }

  private observerCallback(entries: IntersectionObserverEntry[]) {
    // 找到当前正在视口上方的标题
    const visibleEntry = entries.find((entry) => entry.isIntersecting);
    if (visibleEntry) {
      console.log('callback', visibleEntry.target.id);
      this.doHighlight(visibleEntry.target.id);
    }
  }
}
