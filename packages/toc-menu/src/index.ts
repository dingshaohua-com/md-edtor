interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface Config {
  contentElement: Document | HTMLElement;
  tocElement: HTMLElement;
  useHash: boolean;
}

// threshold: Array.from({ length: 10 }, (_, i) => i * 0.1),
export class TocMenu {
  private tocData: TocItem[] = [];
  private config: Config = {
    contentElement: document,
    tocElement: document.createElement('DIV'),
    useHash: true,
  };
  private observer: IntersectionObserver;

  // 针对spa或异步等无法正确初始化锚点位置问题
  initScroll() {
    const { hash } = window.location;
    if (hash) {
      const id = decodeURIComponent(hash.substring(1));
      const decodedHash = decodeURIComponent(id);
      const resizeObserver = new ResizeObserver(() => {
        const element = document.getElementById(decodedHash);
        this.doHighlight(decodedHash);
        if (element) {
          element.scrollIntoView();
          this.config.contentElement.addEventListener(
            'scrollend',
            () => {
              this.initBottomListener();
            },
            { once: true },
          );
          resizeObserver.disconnect();
        }
      });
      resizeObserver.observe(document.body);
    } else {
      console.log('最终也执行了');
      setTimeout(() => {
        this.initBottomListener();
      });
    }
  }

  constructor(config: Config) {
    this.initScroll();
    this.config = { ...this.config, ...config };
    this.syncTocData();
    this.renderToc();
    // 开始观测所有标题(高亮)
    this.observer = new IntersectionObserver(this.onObserver.bind(this), {
      root: this.config.contentElement,
      rootMargin: '0px 0px -90% 0px', // 根元素的外边距
    });
    this.tocData.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) this.observer?.observe(el);
    });
  }

  // 扫描 Milkdown 里的标题
  private syncTocData(): TocItem[] {
    const headings = this.config.contentElement.querySelectorAll('h2,h3,h4');
    this.tocData = Array.from(headings).map((h) => ({
      id: h.id || (h.id = `heading-${Math.random().toString(36).slice(2, 7)}`),
      text: h.textContent || '',
      level: parseInt(h.tagName[1], 10),
    }));
    return this.tocData;
  }

  // 渲染目录 DOM
  private renderToc() {
    this.config.tocElement.innerHTML = `
      <div class="toc-title">目录</div>
      <ul class="toc-list">
        ${this.tocData
          .map(
            (item) => `
          <li class="toc-item level-${item.level}" data-id="${item.id}">
            <a href="#${item.id}" data-anchor="${item.id}">${item.text}</a>
          </li>
        `,
          )
          .join('')}
      </ul>
    `;
    // 2. 绑定事件委托
    const container = this.config.tocElement.querySelector('.toc-list');
    container?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      // 确保点击的是 a 标签
      const anchorId = target.getAttribute('data-anchor');

      if (anchorId) {
        e.preventDefault(); // 阻止原生跳转
        this.handleTocClick(anchorId); // 调用你的处理逻辑
      }
    });
  }

  private isManualScrolling = false;
  private handleTocClick(anchorId: string) {
    // 1. 开启锁定
    this.isManualScrolling = true;
    // 2. 立即执行高亮（点击驱动）
    this.doHighlight(anchorId);
    // 3. 执行滚动
    const targetEl = document.getElementById(decodeURIComponent(anchorId));
    const container = this.config.contentElement as HTMLElement;

    if (targetEl) {
      history.pushState(null, '', `#${anchorId}`);
      // ---  如果点击目标和当前位置相等，说名不需要执行滚动 (防止原地踏步导致的锁死) ---
      const startTop = container.scrollTop;
      const maxScroll = container.scrollHeight - container.clientHeight;
      const targetTop = Math.max(0, Math.min(targetEl.offsetTop, maxScroll));
      if (Math.abs(startTop - targetTop) < 1) {
        this.isManualScrolling = false;
        return;
      }

      // --- 否则才滚动 ---
      targetEl.scrollIntoView({ behavior: 'smooth' });
      container.addEventListener(
        'scrollend',
        () => {
          this.isManualScrolling = false;
        },
        { once: true },
      );
    }
  }

  // 在 scroll 事件中保底，而不是在 Observer 中
  private initBottomListener() {
    console.log('initBottomListener');

    const container = this.config.contentElement as HTMLElement;
    container.addEventListener(
      'scroll',
      () => {
        if (this.isManualScrolling) return;

        const { scrollTop, scrollHeight, clientHeight } = container;
        // 只要滚动超过了 95% 的进度
        if (scrollTop + clientHeight >= scrollHeight - 50) {
          // 此时不再信任 IntersectionObserver 的“碰线”逻辑
          // 直接把高亮给最后一个
          this.doHighlight(this.tocData[this.tocData.length - 1].id);
        }
      },
      { passive: true },
    );
  }

  private onObserver(entries?: IntersectionObserverEntry[]) {
    if (entries && entries.length > 0 && !this.isManualScrolling) {
      const intersectingEntries = entries.filter((entry) => entry.isIntersecting);
      console.log(intersectingEntries.map((it) => it.target.id));
      if (intersectingEntries.length > 0) {
        const targetId = intersectingEntries[intersectingEntries.length - 1].target.id;
        this.doHighlight(targetId);
      }
    }
  }

  // 高亮逻辑：操作 CSS 类
  private doHighlight(id: string) {
    const target = this.config.tocElement;
    if (!target) return;
    const items = target.querySelectorAll('.toc-item');
    items.forEach((el) => {
      // 使用 toggle 的第二个参数更加简洁
      el.classList.toggle('active', el.getAttribute('data-id') === id);
    });
  }
}
