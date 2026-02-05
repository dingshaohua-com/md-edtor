import { useEffect, useState } from 'react';
import { RiLink } from '@remixicon/react';
import { cn } from '@repo/ui-shadcn/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui-shadcn/components/ui/popover';
import { Input } from '@repo/ui-shadcn/components/ui/input';
import { Button } from '@repo/ui-shadcn/components/ui/button';

interface LinkPopoverProps {
  isActive: boolean;
  disabled?: boolean;
  currentHref?: string;
  onConfirm: (url: string) => void;
  onRemove?: () => void;
}

export default function LinkPopover({ isActive, disabled, currentHref, onConfirm, onRemove }: LinkPopoverProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');

  // 打开浮窗时，如果已有链接则显示当前链接
  useEffect(() => {
    if (open && currentHref) {
      setUrl(currentHref);
    } else if (!open) {
      setUrl('');
    }
  }, [open, currentHref]);

  const handleConfirm = () => {
    if (url.trim()) {
      onConfirm(url.trim());
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
    onRemove?.();
    setUrl('');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={(v) => !disabled && setOpen(v)}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            'rounded p-1 box-content cursor-pointer hover:bg-gray-200',
            { 'bg-gray-200': isActive },
            { 'opacity-40 cursor-not-allowed hover:bg-transparent': disabled },
          )}
          onMouseDown={(e) => e.preventDefault()}
        >
          <RiLink size={16} />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="flex flex-col gap-3">
          <div className="text-sm font-medium">{currentHref ? '编辑链接' : '插入链接'}</div>
          <Input
            placeholder="请输入链接地址"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
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
