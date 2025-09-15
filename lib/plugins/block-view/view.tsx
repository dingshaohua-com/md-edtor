import { BlockProvider } from "@milkdown/kit/plugin/block";
import { useInstance } from "@milkdown/react";
import { useEffect, useRef } from "react";
import blockImg from "../../images/block.svg";



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
