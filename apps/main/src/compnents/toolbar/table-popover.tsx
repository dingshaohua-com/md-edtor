import { insertTableCommand } from '@milkdown/kit/preset/gfm';
import { useInstance } from '@milkdown/react';
import { RiTable3 } from '@remixicon/react';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui-shadcn/components/ui/popover';
import { cn } from '@repo/ui-shadcn/lib/utils';
import { useCallback, useState } from 'react';
import { getEditor } from '@/utils/milkdown-helper';

/** 网格最大行列数 */
const MAX_ROWS = 8;
const MAX_COLS = 8;

export default function TablePopover() {
  const [_, get] = useInstance();
  const [open, setOpen] = useState(false);
  const [hoverRow, setHoverRow] = useState(0);
  const [hoverCol, setHoverCol] = useState(0);

  /**
   * 鼠标悬停到某个格子
   */
  const handleCellHover = useCallback((row: number, col: number) => {
    setHoverRow(row);
    setHoverCol(col);
  }, []);

  /**
   * 点击格子，插入表格
   */
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      const { view, commands } = getEditor(get);
      commands.call(insertTableCommand.key, { row, col });
      view.focus();
      setOpen(false);
      setHoverRow(0);
      setHoverCol(0);
    },
    [get],
  );

  /**
   * 鼠标离开网格区域
   */
  const handleGridLeave = useCallback(() => {
    setHoverRow(0);
    setHoverCol(0);
  }, []);

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) {
      setHoverRow(0);
      setHoverCol(0);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div
          className={cn('rounded p-1 box-content cursor-pointer hover:bg-gray-200')}
          onMouseDown={(e) => e.preventDefault()}
        >
          <RiTable3 size={16} />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium text-gray-500">表格</div>

          {/* 网格选择区域 */}
          <div
            className="inline-grid gap-[3px]"
            style={{ gridTemplateColumns: `repeat(${MAX_COLS}, 1fr)` }}
            onMouseLeave={handleGridLeave}
          >
            {Array.from({ length: MAX_ROWS }, (_, rowIdx) =>
              Array.from({ length: MAX_COLS }, (_, colIdx) => {
                const row = rowIdx + 1;
                const col = colIdx + 1;
                const isHighlighted = row <= hoverRow && col <= hoverCol;

                return (
                  <div
                    key={`${row}-${col}`}
                    className={cn(
                      'w-5 h-5 rounded-[3px] border cursor-pointer transition-colors duration-75',
                      isHighlighted
                        ? 'bg-blue-100 border-blue-300'
                        : 'bg-white border-gray-200 hover:border-gray-300',
                    )}
                    onMouseEnter={() => handleCellHover(row, col)}
                    onClick={() => handleCellClick(row, col)}
                  />
                );
              }),
            )}
          </div>

          {/* 尺寸提示 */}
          <div className="text-sm text-gray-400 text-center">
            {hoverRow > 0 && hoverCol > 0 ? `${hoverRow} x ${hoverCol}` : '选择表格大小'}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
