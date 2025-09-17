import { BlockProvider } from "@milkdown/kit/plugin/block";
import { useInstance } from "@milkdown/react";
import { useEffect, useRef, useState } from "react";
import blockImg from "../../images/block.svg";
import { cn } from "../../utils"
import { selectedBlockViewSlice } from "../../hooks/use-milkdown-context"



export const View = () => {
  const ref = useRef<HTMLDivElement>(null);
  const blockProvider = useRef<BlockProvider>(null);

  const [loading, get] = useInstance();

  useEffect(() => {
    const div = ref.current;
    if (loading || !div) return;

    const editor = get();
    if (!editor) return;

    blockProvider.current = new BlockProvider({
      ctx: editor.ctx,
      content: div,
    });

    blockProvider.current.update();
    return () => {
      blockProvider.current?.destroy();
    };
  }, [loading]);

  // After clicking, freeze or unfreeze the current blockProvider.
  const [locked, setLocked] = useState(false);
  const doLock = () => {
    // 通过 Milkdown context 通知 tooltip-selection 隐藏
    const editor = get()!;
    editor.ctx.set(selectedBlockViewSlice, !locked);

    setLocked(!locked)

  }


  return (
    <>
      <div
        ref={ref}
        className={cn("cursor-pointer items-center justify-center gap-0.5 transition-all duration-200 absolute z-10 transform-gpu", { "bg-amber-600": locked })}
      >
        <img src={blockImg} alt="block" onClick={() => doLock()} />
      </div>

    </>
  );
};
