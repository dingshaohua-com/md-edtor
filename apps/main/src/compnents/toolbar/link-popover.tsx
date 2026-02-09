import { linkSchema, toggleLinkCommand, updateLinkCommand } from '@milkdown/kit/preset/commonmark';
import { useInstance } from '@milkdown/react';
import { RiLink } from '@remixicon/react';
import { Button } from '@repo/ui-shadcn/components/ui/button';
import { Input } from '@repo/ui-shadcn/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui-shadcn/components/ui/popover';
import { cn } from '@repo/ui-shadcn/lib/utils';
import { useEffect, useState } from 'react';
import { useSelectedFmt } from '@/store/useSeletedFmt';
import { getEditor } from '@/utils/milkdown-helper';

interface LinkPopoverProps {
  isActive: boolean;
}

export default function LinkPopover({ isActive }: LinkPopoverProps) {
  const [_, get] = useInstance();
  const selectedFmt = useSelectedFmt((state) => state);
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const currentHref = selectedFmt.linkHref;

  // 打开浮窗时，如果已有链接则显示当前链接
  useEffect(() => {
    if (open && currentHref) {
      setUrl(currentHref);
    } else if (!open) {
      setUrl('');
    }
  }, [open, currentHref]);

  /**
   * 确认链接
   */
  const handleConfirm = () => {
    const { view, commands } = getEditor(get);
    if (url.trim()) {
      commands.call(selectedFmt.isLink ? updateLinkCommand.key : toggleLinkCommand.key, { href: url });
      view.focus();
      setUrl('');
      setOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    }
  };

  const handleRemove = () => {
    const { ctx, view, from, to, state } = getEditor(get);
    const linkType = linkSchema.type(ctx);
    // 查找包含当前选区的链接节点范围
    let linkStart = -1;
    let linkEnd = -1;
    let linkMark: ReturnType<typeof linkType.isInSet> ;

    // 从光标位置向前后扩展，找到完整的链接范围
    state.doc.nodesBetween(from, from === to ? to + 1 : to, (node, pos) => {
      const mark = linkType.isInSet(node.marks);
      if (mark) {
        linkMark = mark;
        if (linkStart === -1) linkStart = pos;
        linkEnd = pos + node.nodeSize;
      }
    });

    if (linkMark && linkStart !== -1) {
      // 移除链接 mark
      const tr = state.tr.removeMark(linkStart, linkEnd, linkMark);
      view.dispatch(tr);
    }
    view.focus();
    setUrl('');
    setOpen(false);
  };
  
  const canEditLink = selectedFmt.hasSelection || selectedFmt.isLink;
  return (
    <Popover open={open} onOpenChange={(v) => canEditLink && setOpen(v)}>
      <PopoverTrigger asChild>
        <div className={cn('rounded p-1 box-content cursor-pointer hover:bg-gray-200', { 'bg-gray-200': isActive }, { 'opacity-40 cursor-not-allowed hover:bg-transparent': !canEditLink })} onMouseDown={(e) => e.preventDefault()}>
          <RiLink size={16} />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="flex flex-col gap-3">
          <div className="text-sm font-medium">{currentHref ? '编辑链接' : '插入链接'}</div>
          <Input placeholder="请输入链接地址" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={handleKeyDown} autoFocus />
          <div className="flex justify-end gap-2">
            {currentHref && (
              <Button variant="destructive" size="sm" onClick={handleRemove}>
                删除链接
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button size="sm" onClick={handleConfirm} disabled={!url.trim()}>
              确定
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
