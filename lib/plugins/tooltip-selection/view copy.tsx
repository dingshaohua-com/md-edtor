import { TooltipProvider } from "@milkdown/kit/plugin/tooltip";
import {
  toggleEmphasisCommand,
  toggleStrongCommand,
} from "@milkdown/kit/preset/commonmark";
import { useInstance } from "@milkdown/react";
import { usePluginViewContext } from "@prosemirror-adapter/react";
import { useEffect, useRef, useState } from "react";
import {
  RiBold,
  RiItalic,
  RiUnderline,
  RiStrikethrough,
  RiEmphasisCn,
} from "@remixicon/react";
import { cn } from "../../utils";
import { commandsCtx } from "@milkdown/kit/core";
import { toggleStrikethroughCommand } from "@milkdown/kit/preset/gfm";
import { checkMarkActive } from "./helper";
import { toggleUnderlineCommand } from "../../marks/underline";
import { selectedBlockViewSlice } from "../../hooks/use-milkdown-context";
import { EditorView } from "@milkdown/kit/prose/view";
import { TextSelection } from "@milkdown/kit/prose/state";

// 提取默认的 shouldShow 逻辑为独立函数
const defaultShouldShow = (
  view: EditorView,
  tooltipElement: HTMLElement
): boolean => {
  const { doc, selection } = view.state;
  const { empty, from, to } = selection;

  const isEmptyTextBlock =
    !doc.textBetween(from, to).length &&
    view.state.selection instanceof TextSelection;

  const isTooltipChildren = tooltipElement.contains(document.activeElement);
  const notHasFocus = !view.hasFocus() && !isTooltipChildren;
  const isReadonly = !view.editable;

  if (notHasFocus || empty || isEmptyTextBlock || isReadonly) return false;

  return true;
};

const View = () => {
  const ref = useRef<HTMLDivElement>(null);
  const tooltipProvider = useRef<TooltipProvider>(null);

  const { view, prevState } = usePluginViewContext();
  const [loading, get] = useInstance();
  const [selectedBlockView, setSelectedBlockView] = useState(false);
  const selectedBlockViewRef = useRef(false);

  useEffect(() => {
    const div = ref.current;
    if (loading || !div) {
      return;
    }

    tooltipProvider.current = new TooltipProvider({
      content: div,
      // debounce: 1000, // 增加防抖时间，给状态更新留出时间
      shouldShow: (view) => {
        const selectedBlockViewSliceTemp = editor.ctx.get(
          selectedBlockViewSlice
        );
        // 当 selectedBlockView 为 true 时，永远不显示
        if (selectedBlockViewSliceTemp) {
          console.log("不显示");

          return false;
        }
        console.log("默认逻辑", selectedBlockViewSliceTemp);
        // 否则使用默认逻辑
        return defaultShouldShow(view, div);
      },
    });

    // 重写 show 方法，在显示前再次检查状态
    // const originalShow = tooltipProvider.current.show;
    // tooltipProvider.current.show = (virtualElement) => {
    //   // 显示前最后一次检查
    //   const selectedBlockViewSliceTemp = editor.ctx.get(selectedBlockViewSlice);
    //   console.log(
    //     "最后一次检查",
    //     selectedBlockViewRef.current,
    //     selectedBlockViewSliceTemp
    //   );

    //   if (selectedBlockViewRef.current) {
    //     return; // 直接返回，不执行显示
    //   }
    //   originalShow.call(tooltipProvider.current, virtualElement);
    // };
    const editor = get();
    if (editor) {
      const counterSlice = editor.ctx.use(selectedBlockViewSlice);
      counterSlice.on((status) => {
        setSelectedBlockView(status);
        selectedBlockViewRef.current = status;
        // if(tooltipProvider.current && !status){
        //   tooltipProvider.current.hide();
        // }
      });
    }
    return () => {
      tooltipProvider.current?.destroy();
    };
  }, [get, loading]);

  useEffect(() => {
    tooltipProvider.current?.update(view, prevState);
  });

  const editor = get();

  const helper = {
    strong: {
      active: checkMarkActive("strong", editor),
      onClick: () =>
        editor?.action((ctx) =>
          ctx.get(commandsCtx).call(toggleStrongCommand.key)
        ),
    },
    emphasis: {
      active: checkMarkActive("emphasis", editor),
      onClick: () =>
        editor?.action((ctx) =>
          ctx.get(commandsCtx).call(toggleEmphasisCommand.key)
        ),
    },
    strikeThrough: {
      active: checkMarkActive("strike_through", editor),
      onClick: () => {
        editor?.action((ctx) =>
          ctx.get(commandsCtx).call(toggleStrikethroughCommand.key)
        );
      },
    },
    underline: {
      active: checkMarkActive("underline", editor),
      onClick: () => {
        editor?.action((ctx) =>
          ctx.get(commandsCtx).call(toggleUnderlineCommand.key)
        );
      },
    },
  };

  return (
    <div
      className="tooltip-selection absolute data-[show=false]:hidden flex items-center justify-center  rounded border border-gray-200 cursor-pointer bg-white box-border p-1 gap-1"
      ref={ref}
    >
      <div
        className={cn("item", { "bg-gray-300": helper.strong.active })}
        onClick={helper.strong.onClick}
        onMouseDown={(e) => e.preventDefault()}
      >
        <RiBold size={18} />
        <span>{selectedBlockView?.toString()}</span>
      </div>
      <div
        className={cn("item", { "bg-gray-300": helper.emphasis.active })}
        onClick={helper.emphasis.onClick}
        onMouseDown={(e) => e.preventDefault()}
      >
        <RiItalic size={18} />
      </div>
      <div
        className={cn("item", { "bg-gray-300": helper.strikeThrough.active })}
        onClick={helper.strikeThrough.onClick}
        onMouseDown={(e) => e.preventDefault()}
      >
        <RiStrikethrough size={18} />
      </div>
      <div
        className={cn("item", { "bg-gray-300": helper.underline.active })}
        onClick={helper.underline.onClick}
        onMouseDown={(e) => e.preventDefault()}
      >
        <RiUnderline size={18} />
      </div>
    </div>
  );
};

export default View;
