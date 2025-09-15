import { BlockProvider } from "@milkdown/kit/plugin/block";
import { useInstance } from "@milkdown/react";
import { useEffect, useRef, useState } from "react";
import blockImg from "../../images/block.svg";



export const View = () => {
  const ref = useRef<HTMLDivElement>(null);
  const tooltipProvider = useRef<BlockProvider>(null);

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
    
    // tooltipProvider.current?.update();

    tooltipProvider.current.show();


    return () => {
      tooltipProvider.current?.destroy();
    };
  }, [loading]);


  return (
    <>
      <div
        ref={ref}
        className="cursor-pointer items-center justify-center gap-0.5 transition-all duration-200 absolute z-10 transform-gpu"
      >
        <img src={blockImg} alt="block" />
      </div>
   
    </>
  );
};
