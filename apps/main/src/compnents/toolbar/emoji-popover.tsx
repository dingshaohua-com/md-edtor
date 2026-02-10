import { useInstance } from '@milkdown/react';
import { RiEmojiStickerLine } from '@remixicon/react';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui-shadcn/components/ui/popover';
import { cn } from '@repo/ui-shadcn/lib/utils';
import { EmojiPicker } from 'frimousse';
import { useState } from 'react';
import { getEditor } from '@/utils/milkdown-helper';

export default function EmojiPopover() {
  const [_, get] = useInstance();
  const [open, setOpen] = useState(false);

  /**
   * 选中 emoji 后插入编辑器
   */
  const handleEmojiSelect = ({ emoji }: { emoji: string }) => {
    const { view, state } = getEditor(get);
    const { from } = state.selection;
    const tr = state.tr.insertText(emoji, from);
    view.dispatch(tr);
    view.focus();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn('rounded p-1 box-content cursor-pointer hover:bg-gray-200')}
          onMouseDown={(e) => e.preventDefault()}
        >
          <RiEmojiStickerLine size={16} />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0" align="start">
        <EmojiPicker.Root
          className="isolate flex h-[340px] w-fit flex-col"
          onEmojiSelect={handleEmojiSelect}
          locale="zh"
          columns={8}
        >
          <EmojiPicker.Search
            className="z-10 mx-2 mt-2 appearance-none rounded-md bg-gray-100 px-2.5 py-1.5 text-sm outline-none placeholder:text-gray-400"
            placeholder="搜索表情..."
          />
          <EmojiPicker.Viewport className="relative flex-1 outline-hidden">
            <EmojiPicker.Loading className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
              加载中...
            </EmojiPicker.Loading>
            <EmojiPicker.Empty className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
              {({ search }) => <>未找到 "{search}" 相关表情</>}
            </EmojiPicker.Empty>
            <EmojiPicker.List
              className="select-none pb-1.5"
              components={{
                CategoryHeader: ({ category, ...props }) => (
                  <div
                    className="bg-white px-3 pt-3 pb-1.5 text-xs font-medium text-gray-500"
                    {...props}
                  >
                    {category.label}
                  </div>
                ),
                Row: ({ children, ...props }) => (
                  <div className="scroll-my-1.5 px-1.5" {...props}>
                    {children}
                  </div>
                ),
                Emoji: ({ emoji, ...props }) => (
                  <button
                    className="flex size-8 items-center justify-center rounded-md text-lg data-[active]:bg-gray-100"
                    {...props}
                  >
                    {emoji.emoji}
                  </button>
                ),
              }}
            />
          </EmojiPicker.Viewport>
          {/* 底部预览 */}
          <EmojiPicker.ActiveEmoji>
            {({ emoji }) => (
              <div className="flex h-9 items-center gap-2 border-t border-gray-100 px-3">
                {emoji ? (
                  <>
                    <span className="text-xl">{emoji.emoji}</span>
                    <span className="truncate text-xs text-gray-400">{emoji.label}</span>
                  </>
                ) : (
                  <span className="text-xs text-gray-300">选择一个表情...</span>
                )}
              </div>
            )}
          </EmojiPicker.ActiveEmoji>
        </EmojiPicker.Root>
      </PopoverContent>
    </Popover>
  );
}
