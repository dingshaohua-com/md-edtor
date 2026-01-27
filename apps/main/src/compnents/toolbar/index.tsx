import { cn } from '@repo/ui-shadcn/lib/utils';
import { useSelectedFmt } from '@/store/useSeletedFmt';
import { bars } from './helper';

export default function Toolbar() {
  const selectedFmt = useSelectedFmt((state) => state);
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
  return (
    <div className="border-b p-2 flex">
      {bars.map((bar) => (
        <div key={bar.type} className="flex items-center gap-1 border-r border-gray-200 pr-2">
          {bar.content.map(({ icon: Icon, tooltip, id }) => (
            <Icon key={id} className={cn('rounded p-1 box-content cursor-pointer hover:bg-gray-100 ', { 'bg-gray-300': getActive(id) })} size={16} />
          ))}
        </div>
      ))}
    </div>
  );
}
