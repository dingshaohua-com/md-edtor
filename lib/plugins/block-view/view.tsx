import { cn } from '../../utils';
import MenuView from './menu-view';
import { useInstance } from '@milkdown/react';
import blockImg from '../../images/block.svg';
import { useEffect, useRef, useState } from 'react';
import { BlockProvider, blockServiceInstance } from '@milkdown/kit/plugin/block';
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react';

export const View = () => {
  const floatingRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const blockProvider = useRef<BlockProvider>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [animationScale, setAnimationScale] = useState(1);
  const [shouldRender, setShouldRender] = useState(false);
  const [currentBlock, setCurrentBlock] = useState<any>(null);


  const [loading, get] = useInstance();

  const { refs, floatingStyles } = useFloating({
    whileElementsMounted: autoUpdate,
    placement: 'left',
    middleware: [offset(5), flip(), shift({ padding: 5 })],
    strategy: 'fixed', // 关键配置
  });

  const doSome = () => {
    const editor = get()!;
    const service = editor.ctx.get(blockServiceInstance.key);
    // 保存原始的 bind 方法
    const originalBind = service.bind;
    // 重写 bind 方法
    service.bind = (ctx, notify) => {
      // 包装 notify 函数
      const wrappedNotify = (message: any) => {
        console.log(message.active.node.content.size);
        // 调用原始 notify
        notify(message);
      };
      // 调用原始 bind
      return originalBind.call(service, ctx, wrappedNotify);
    };
  }

  // 处理缩放动画和渲染状态
  useEffect(() => {
    if (isOpen) {
      // 打开：先渲染DOM，但完全不可见
      setShouldRender(true);
      setAnimationScale(0);

      // 延迟更长时间确保 Floating UI 位置计算完成
      const timer = setTimeout(() => {
        setAnimationScale(0.5);
        requestAnimationFrame(() => {
          setAnimationScale(1);
        });
      }, 50);

      return () => clearTimeout(timer);
    } else {
      // 关闭：先缩放动画，然后移除DOM
      setAnimationScale(0.8);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 100); // 等待动画完成
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const div = ref.current;
    if (loading || !div) return;

    const editor = get();
    if (!editor) return;

    doSome();

    // 创建自定义的 BlockProvider
    blockProvider.current = new BlockProvider({
      ctx: editor.ctx,
      content: div,
    });

    blockProvider.current.update();
    // setTimeout(() => {
      
    // })

    return () => {
      blockProvider.current?.destroy();
    };
  }, [loading]);


  const doLock = () => {
    setIsOpen(!isOpen);

    // try {
    //   const editor = get()!;
    //   const service = editor.ctx.get(blockServiceInstance.key);
    //   console.log('Block service methods:', Object.getOwnPropertyNames(service));

    //   // 直接从编辑器获取当前选择的节点
    //   const editorView = (editor as any).view;
    //   if (editorView) {
    //     const { state } = editorView;
    //     const { selection } = state;
    //     const { $from } = selection;

    //     // 获取当前块级节点
    //     const node = $from.node($from.depth);
    //     const isEmpty = node.content.size === 0;
    //     const textContent = node.textContent || '';

    //     console.log('Current node info:', {
    //       type: node.type.name,
    //       isEmpty: isEmpty,
    //       textContent: textContent,
    //       contentSize: node.content.size
    //     });

    //     // 更新状态
    //     setCurrentBlock({
    //       type: node.type.name,
    //       isEmpty: isEmpty,
    //       textContent: textContent,
    //       size: node.content.size
    //     });
    //   } else {
    //     console.log('Cannot access editor view');
    //     setCurrentBlock({ type: 'no-view', isEmpty: true });
    //   }
    // } catch (error) {
    //   console.error('Error getting block info:', error);
    //   setCurrentBlock({ type: 'error', isEmpty: true });
    // }

  };

  const hideMenuView = () => {
    setIsOpen(false);
  };

  return (
    <>
      <div
        ref={(node) => {
          if (node) {
            refs.setReference(node);
            ref.current = node;
          }
        }}
        className={cn('cursor-pointer items-center justify-center gap-0.5 transition-all duration-200 absolute z-10 transform-gpu', { 'bg-gray-100': isOpen })}
      >
        <img src={blockImg} alt="block" onClick={() => doLock()} />
      </div>

      <>
        {/* 遮罩层 */}
        <div className={`fixed inset-0 z-[1] transition-opacity  ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={hideMenuView} />

        {/* 菜单内容 */}
        {shouldRender && (
          <div
            ref={(node) => {
              if (node) {
                refs.setFloating(node);
                floatingRef.current = node;
              }
            }}
            className="transition-all duration-50 ease-out"
            style={{
              ...floatingStyles,
              zIndex: 2,
              transform: `${floatingStyles.transform || ''} scale(${animationScale})`,
              transformOrigin: 'center',
              opacity: animationScale === 0 ? 0 : animationScale === 0.8 ? 0 : 1,
              visibility: animationScale === 0 || animationScale === 0.8 ? 'hidden' : 'visible',
            }}
          >
            <MenuView onHide={hideMenuView} />
          </div>
        )}
      </>
    </>
  );
};
