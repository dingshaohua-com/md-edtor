import { BlockProvider } from "@milkdown/kit/plugin/block";
import { useInstance } from "@milkdown/react";
import { useEffect, useRef, useState } from "react";
import blockImg from "../../images/block.svg";
import { cn } from "../../utils";
import { autoUpdate, useFloating } from "@floating-ui/react";
import MenuView from "./menu-view";

export const View = () => {
  const floatingRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const blockProvider = useRef<BlockProvider>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  const [loading, get] = useInstance();

  const { refs, floatingStyles } = useFloating({
    whileElementsMounted: autoUpdate,
  });

  // 处理动画时机，确保位置计算完成后再显示动画
  useEffect(() => {
    if (isOpen) {
      // 小延迟确保 Floating UI 位置计算完成
      const timer = setTimeout(() => {
        setShowAnimation(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setShowAnimation(false);
    }
  }, [isOpen]);


  useEffect(() => {
    const div = ref.current;
    if (loading || !div) return;

    const editor = get();
    if (!editor) return;

    // 创建自定义的 BlockProvider
    blockProvider.current = new BlockProvider({
      ctx: editor.ctx,
      content: div,
    });

    blockProvider.current.update();
    return () => {
      blockProvider.current?.destroy();
    };
  }, [loading]);

  const doLock = () => {
    setIsOpen(!isOpen);

  };

  const hideMenuView = () => {
    setIsOpen(false);
  }

  return (
    <>
      <div
        ref={(node) => {
          if (node) {
            refs.setReference(node);
            ref.current = node;
          }
        }}
        className={cn(
          "cursor-pointer items-center justify-center gap-0.5 transition-all duration-200 absolute z-10 transform-gpu",
          { "bg-gray-100": isOpen }
        )}
      >
        <img src={blockImg} alt="block" onClick={() => doLock()} />
      </div>

      <>
        {/* 遮罩层 */}
        <div
          className={`fixed inset-0 z-[1] transition-opacity duration-100 ${
            isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={hideMenuView}
        />

        {/* 菜单内容 */}
        <div
          ref={(node) => {
            if (node) {
              refs.setFloating(node);
              floatingRef.current = node;
            }
          }}
          className={`transition-all duration-100 ${
            isOpen && showAnimation ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
          }`}
          style={{
            ...floatingStyles,
            zIndex: 2,
            visibility: isOpen ? 'visible' : 'hidden'
          }}
        >
          <MenuView onHide={hideMenuView} />
        </div>
      </>
    </>
  );
};