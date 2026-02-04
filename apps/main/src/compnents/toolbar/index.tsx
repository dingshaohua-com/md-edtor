import { commandsCtx } from '@milkdown/kit/core';
import { toggleEmphasisCommand, toggleInlineCodeCommand, toggleLinkCommand, toggleStrongCommand } from '@milkdown/kit/preset/commonmark';
import { toggleStrikethroughCommand } from '@milkdown/kit/preset/gfm';
import { useInstance } from '@milkdown/react';
import { cn } from '@repo/ui-shadcn/lib/utils';
import { useSelectedFmt } from '@/store/useSeletedFmt';
import { bars } from './helper';

export default function Toolbar() {
  const selectedFmt = useSelectedFmt((state) => state);
  const [, get] = useInstance();

  const getActive = (id: string) => {
    const fmtMap = {
      strong: selectedFmt.isBold,
      italic: selectedFmt.isItalic,
      inlineCode: selectedFmt.isInlineCode,
      link: selectedFmt.isLink,
      strike: selectedFmt.isStrike
    };
    // @ts-ignore
    return fmtMap[id];
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // 阻止按钮获取焦点，保持编辑器选区
    const ctx = get()?.ctx;
    if (!ctx) return;

    const commandMap = {
      strong: toggleStrongCommand.key,
      italic: toggleEmphasisCommand.key,
      inlineCode: toggleInlineCodeCommand.key,
      link: toggleLinkCommand.key,
      strike: toggleStrikethroughCommand.key,
    } as const;
    const command = commandMap[id as keyof typeof commandMap];
    if (command) {
      ctx.get(commandsCtx).call(command);
    }
  };
  return (
    <div className="border-b p-2 flex">
      {bars.map((bar) => (
        <div key={bar.type} className="flex items-center gap-1 border-r border-gray-200 pr-2">
          {bar.content.map(({ icon: Icon, tooltip, id }) => (
            <Icon key={id} className={cn('rounded p-1 box-content cursor-pointer hover:bg-gray-100 ', { 'bg-gray-300': getActive(id) })} size={16} onMouseDown={(e) => handleMouseDown(e, id)}/>
          ))}
        </div>
      ))}
    </div>
  );
}
