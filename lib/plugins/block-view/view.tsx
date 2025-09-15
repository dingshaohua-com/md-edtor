import { BlockProvider } from "@milkdown/kit/plugin/block";
import { useInstance } from "@milkdown/react";
import { useEffect, useRef, useState } from "react";
import blockImg from "../../images/block.svg";
import { autoUpdate, useFloating } from "@floating-ui/react";
import MenuView from "./menu-view";

export const View = () => {
  const ref = useRef<HTMLDivElement>(null);
  const tooltipProvider = useRef<BlockProvider>(null);
  const floatingRef = useRef<HTMLDivElement>(null);
  const { refs, floatingStyles } = useFloating({
    whileElementsMounted: autoUpdate,
  });

  const [loading, get] = useInstance();

  useEffect(() => {
    const div = ref.current;
    if (loading || !div) return;

    const editor = get();
    if (!editor) return;

    tooltipProvider.current = new BlockProvider({
      ctx: editor.ctx,
      content: div,
    });
    tooltipProvider.current?.update();

    return () => {
      tooltipProvider.current?.destroy();
    };
  }, [loading]);
  const [isOpen, setIsOpen] = useState(false);

  const onClick = () => {
    setIsOpen(true);
  };

  const hideMenuView = () => {
    setIsOpen(false);
  };
  return (
    <>
      <div
        ref={ref}
        className=" data-[show=true]:block hidden cursor-pointer transition-all duration-200 absolute z-10 transform-gpu"
      >
        <img src={blockImg} alt="block" onClick={onClick} />
      </div>
      {isOpen && (
        <div
          ref={(node) => {
            if (node) {
              refs.setFloating(node);
              floatingRef.current = node;
            }
          }}
          style={{
            ...floatingStyles,
            zIndex: 2,
          }}
        >
          <MenuView hide={hideMenuView} />
        </div>
      )}
    </>
  );
};
