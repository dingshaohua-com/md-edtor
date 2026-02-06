import { commandsCtx, editorViewCtx, serializerCtx } from '@milkdown/kit/core';
import { toggleEmphasisCommand, toggleInlineCodeCommand, toggleLinkCommand, updateLinkCommand, toggleStrongCommand, wrapInHeadingCommand } from '@milkdown/kit/preset/commonmark';
import { toggleStrikethroughCommand } from '@milkdown/kit/preset/gfm';
import { useInstance } from '@milkdown/react';
import { RiSave3Line } from '@remixicon/react';
import { cn } from '@repo/ui-shadcn/lib/utils';
import { useSelectedFmt } from '@/store/useSeletedFmt';
import { bars, getCurrentHeadingLevel, headingOptions } from './helper';
import LinkPopover from './link-popover';
import { linkRemove } from './link-helper';

export default function Toolbar() {
  const selectedFmt = useSelectedFmt((state) => state);
  const [, get] = useInstance();

  const getActive = (id: string) => {
    const fmtMap = {
      strong: selectedFmt.isBold,
      italic: selectedFmt.isItalic,
      inlineCode: selectedFmt.isInlineCode,
      link: selectedFmt.isLink,
      strike: selectedFmt.isStrike,
    };
    // @ts-ignore
    return fmtMap[id];
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const ctx = get()?.ctx;
    if (!ctx) return;

    // link 由 LinkPopover 组件处理
    if (id === 'link') return;

    const commandMap = {
      strong: toggleStrongCommand.key,
      italic: toggleEmphasisCommand.key,
      inlineCode: toggleInlineCodeCommand.key,
      strike: toggleStrikethroughCommand.key,
    } as const;
    const command = commandMap[id as keyof typeof commandMap];
    if (command) {
      ctx.get(commandsCtx).call(command);
    }
  };

  const handleLinkConfirm = (url: string) => {
    const ctx = get()?.ctx;
    if (!ctx) return;
    // 如果已经是链接，使用 updateLinkCommand 更新；否则使用 toggleLinkCommand 创建
    if (selectedFmt.isLink) {
      ctx.get(commandsCtx).call(updateLinkCommand.key, { href: url });
    } else {
      ctx.get(commandsCtx).call(toggleLinkCommand.key, { href: url });
    }
    // 让编辑器重新获取焦点
    const view = ctx.get(editorViewCtx);
    view.focus();
  };

  const handleLinkRemove = () => linkRemove();

  const handleHeadingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ctx = get()?.ctx;
    if (!ctx) return;
    const view = ctx.get(editorViewCtx);
    // 执行命令
    ctx.get(commandsCtx).call(wrapInHeadingCommand.key, Number(e.target.value));
    // 让编辑器重新获取焦点
    view.focus();
  };

  const handleSave = () => {
    const ctx = get()?.ctx;
    if (!ctx) return;
    const view = ctx.get(editorViewCtx);
    const serializer = ctx.get(serializerCtx);
    const markdown = serializer(view.state.doc);
    console.log(markdown);
  };

  // 获取当前标题级别，如果不在选项列表中则显示为正文
  const currentHeadingLevel = getCurrentHeadingLevel(selectedFmt.headingLevel!);

  return (
    <div className="border-b p-2 flex items-center gap-2">
      <select className="h-7 px-2 text-sm border border-gray-200 rounded cursor-pointer hover:bg-gray-50 focus:outline-none" onChange={handleHeadingChange} value={currentHeadingLevel}>
        {headingOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="w-px h-5 bg-gray-200" />
      {bars.map((bar) => (
        <div key={bar.type} className="flex items-center gap-1">
          {bar.content.map(({ icon: Icon, id }) => {
            // 超链接使用 Popover 组件
            // 如果有选中文本或者已经是链接，都可以操作
            if (id === 'link') {
              const canEditLink = selectedFmt.hasSelection || selectedFmt.isLink;
              return <LinkPopover key={id} isActive={getActive(id)} disabled={!canEditLink} currentHref={selectedFmt.linkHref} onConfirm={handleLinkConfirm} onRemove={handleLinkRemove} />;
            }
            return <Icon key={id} className={cn('rounded p-1 box-content cursor-pointer hover:bg-gray-200 ', { 'bg-gray-200': getActive(id) })} size={16} onMouseDown={(e) => handleMouseDown(e, id)} />;
          })}
        </div>
      ))}
      <div className="w-px h-5 bg-gray-200" />
      <RiSave3Line className="rounded p-1 box-content cursor-pointer hover:bg-gray-200" size={16} onClick={handleSave} />
    </div>
  );
}
