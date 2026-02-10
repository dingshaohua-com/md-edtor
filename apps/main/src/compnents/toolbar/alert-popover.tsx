import { paragraphSchema } from '@milkdown/kit/preset/commonmark';
import { TextSelection, type Transaction } from '@milkdown/kit/prose/state';
import { useInstance } from '@milkdown/react';
import { RiAlertLine } from '@remixicon/react';
import { githubAlertSchema } from '@repo/milkdown-plugin/github-alert.ts';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui-shadcn/components/ui/popover';
import { cn } from '@repo/ui-shadcn/lib/utils';
import { useCallback, useState } from 'react';
import { getEditor } from '@/utils/milkdown-helper';

/** Alert 类型定义 */
const ALERT_OPTIONS = [
  { type: 'note', label: 'Note', desc: '信息提示', color: '#478be6' },
  { type: 'tip', label: 'Tip', desc: '有用建议', color: '#3fb950' },
  { type: 'important', label: 'Important', desc: '重要信息', color: '#a371f7' },
  { type: 'warning', label: 'Warning', desc: '需要注意', color: '#d29922' },
  { type: 'caution', label: 'Caution', desc: '危险操作', color: '#f85149' },
] as const;

export default function AlertPopover() {
  const [_, get] = useInstance();
  const [open, setOpen] = useState(false);

  /**
   * 插入指定类型的 alert 容器
   */
  const handleInsert = useCallback(
    (alertType: string) => {
      const { ctx, view, state } = getEditor(get);
      const alertNodeType = githubAlertSchema.type(ctx);
      const paragraphType = paragraphSchema.type(ctx);

      // 创建一个包含空段落的 alert 节点
      const alertNode = alertNodeType.create(
        { alertType },
        [paragraphType.create()],
      );

      const { from } = state.selection;
      const $from = state.doc.resolve(from);
      const parentBlock = $from.parent;

      let tr: Transaction;
      if (parentBlock.type.name === 'paragraph' && parentBlock.content.size === 0) {
        // 当前段落为空 → 直接替换掉空段落
        const blockStart = $from.before($from.depth);
        const blockEnd = $from.after($from.depth);
        tr = state.tr.replaceWith(blockStart, blockEnd, alertNode);
        tr.setSelection(TextSelection.create(tr.doc, blockStart + 2));
      } else {
        // 当前段落有内容 → 在当前块后面插入
        const insertPos = $from.after($from.depth);
        tr = state.tr.replaceWith(insertPos, insertPos, alertNode);
        tr.setSelection(TextSelection.create(tr.doc, insertPos + 2));
      }

      view.dispatch(tr);
      view.focus();
      setOpen(false);
    },
    [get],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn('rounded p-1 box-content cursor-pointer hover:bg-gray-200')}
          onMouseDown={(e) => e.preventDefault()}
        >
          <RiAlertLine size={16} />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-1.5" align="start">
        <div className="flex flex-col">
          <div className="px-2 py-1.5 text-xs font-medium text-gray-400">插入提示容器</div>
          {ALERT_OPTIONS.map(({ type, label, desc, color }) => (
            <button
              key={type}
              type="button"
              className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-gray-100"
              onClick={() => handleInsert(type)}
            >
              <div
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded"
                style={{ backgroundColor: `${color}15` }}
              >
                <div
                  className="h-3 w-0.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-gray-700 text-xs" style={{ color }}>
                  {label}
                </span>
                <span className="text-[11px] text-gray-400 truncate">{desc}</span>
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
