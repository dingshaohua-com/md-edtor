import { useEffect } from 'react';
import tocbot from 'tocbot';

export default function useTocbot() {
  useEffect(() => {
    // 初始化 Tocbot
    requestAnimationFrame(() => {
      tocbot.init({
        tocSelector: '.js-toc', // 导航渲染位置
        contentSelector: '.prose-custom', // 标题提取来源 (你的 Milkdown 容器类名)
        headingSelector: 'h2, h3, h4', // 提取二级和三级标题
        scrollSmooth: false, // 顺滑滚动
        headingsOffset: 10, // 修正点击跳转后标题被顶栏挡住的问题
        hasInnerContainers: true, // 如果标题在嵌套容器里，开启此项
        scrollContainer: '.prose-custom',  // 默认是 window
        enableUrlHashUpdateOnScroll: true,
      });
    });

    return () => tocbot.destroy(); // 组件卸载记得销毁
  }, []);
  return {
    tocbot,
  };
}
