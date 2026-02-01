interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface Options extends IntersectionObserverInit {
  headingsElement?: Element | Document | HTMLElement | null;
  targetElement?: Element | null;
}

export class TocMenu {
  private tocData: Array<TocItem> = [];
  private scrollTimer: null | number = null;
  private observer: IntersectionObserver | null = null;
  private options: Options = {
    root: null, // 根元素，null表示视口元素
    rootMargin: '0px 0px -98% 0px', // 根元素的外边距
    // threshold: 0.5, // 交叉比例的阈值
    // 监听元素从 0% 到 100% 出现的每一刻
    threshold: Array.from({ length: 10 }, (_, i) => i * 0.1),
    // threshold: [0, 0.2, 0.5, 0.8, 1],
    headingsElement: null, // 标题容器元素，如果不指定就是root
    targetElement: null, // toc菜单挂载位置
  };

  constructor(_options?: Options) {
    const options = { ...this.options, ..._options };
    if (!options.headingsElement) {
      options.headingsElement = options.root;
    }
    this.options = options;
    const tocData = this.getTocData();
    this.tocData = tocData;
    this.renderToc(tocData, this.options.targetElement!);
    // 重点：在观测开始前，先根据当前 Hash 执行一次高亮
  const initialHash = window.location.hash.substring(1);
  if (initialHash) {
    this.doHighlight(decodeURIComponent(initialHash));
  }

    // --- 新增：处理初始化和 URL 锚点 ---
    this.handleInitialState();
    // 开始观测所有标题
    this.observer = new IntersectionObserver(this.onObserver.bind(this), options);
    tocData.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) this.observer?.observe(el);
    });
    this.options.root?.addEventListener('scroll', this.onRootScroll.bind(this), { passive: true });
  }

  // “滚动停止”后的保底执行：防止滑动过快出现高亮丢失问题
  private onRootScroll() {
    if (this.scrollTimer) clearTimeout(this.scrollTimer);
    this.scrollTimer = setTimeout(() => {
      // 获取滚动位置
      const container = this.options.root as HTMLElement;
      const scrollTop = container.scrollTop;
      // 特殊处理 A：回到顶部
      if (scrollTop <= 10) {
        this.tocData.length > 0 && this.doHighlight(this.tocData[0]?.id);
        return;
      }
    }, 100);
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

  // html带锚点的链接，点击浏览器刷新，页面不会滚动到对应位置，只有在地址栏回车才可以
  // private handleInitialState() {
  //   window.addEventListener('load', () => {
  //     if (window.location.hash) {
  //       const id = decodeURI(window.location.hash.substring(1)); // 获取 # 后的 ID
  //       const element = document.getElementById(id);

  //       if (element) {
  //         // 延迟一小会儿执行，确保渲染完成
  //         requestAnimationFrame(() => {
  //           element.scrollIntoView({ behavior: 'smooth' });
  //         });
  //       }
  //     }
  //   });
  // }
  private handleInitialState() {
  // 定义一个统一的跳转/高亮逻辑
  const syncHighlight = () => {
    if (window.location.hash) {
      const id = decodeURIComponent(window.location.hash.substring(1));
      const element = document.getElementById(id);

      if (element) {
        // 1. 立即高亮对应的 TOC 项目 (取消延迟)
        this.doHighlight(id);

        // 2. 滚动处理
        // 如果是点击刷新，浏览器可能已经在那了；如果是新打开，则需要滚动
        requestAnimationFrame(() => {
          element.scrollIntoView({ behavior: 'auto' }); // 改为 'auto' 可以取消平滑滚动的过程感
        });
      }
    }
  };

  // 监听 load 是为了确保内容撑开，高度计算准确
  window.addEventListener('load', syncHighlight);
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
    const target = this.options.targetElement;
    if (!target) return;
    const items = target.querySelectorAll('.toc-item');
    items.forEach((el) => {
      // 使用 toggle 的第二个参数更加简洁
      el.classList.toggle('active', el.getAttribute('data-id') === id);
    });
  }

  private onObserver(entries?: IntersectionObserverEntry[]) {
    if (entries && entries.length > 0) {
      // 过滤出当前正在交叉（可见）的 entry
      const intersectingEntries = entries.filter((entry) => entry.isIntersecting);
      console.log(intersectingEntries.map((it) => it.target.id));

      if (intersectingEntries.length > 0) {
        // 如果有多个标题可见，通常高亮“最上方”的那一个
        // 对于 IntersectionObserver，由于是按顺序进入，取最后一个通常比较符合直觉
        const targetId = intersectingEntries[intersectingEntries.length - 1].target.id;
        this.doHighlight(targetId);
      }
    }
  }

  public destroy() {
    this.observer?.disconnect();
    if (this.options.targetElement) {
      this.options.targetElement.innerHTML = '';
    }
  }
}
