import { serializerCtx } from '@milkdown/kit/core';
import { toggleEmphasisCommand, toggleInlineCodeCommand, toggleStrongCommand, wrapInHeadingCommand } from '@milkdown/kit/preset/commonmark';
import { toggleStrikethroughCommand } from '@milkdown/kit/preset/gfm';
import { useInstance } from '@milkdown/react';
import { RiFlowChart, RiSave3Line } from '@remixicon/react';
import { toggleUnderlineCommand } from '@repo/milkdown-plugin/underline.ts';
import { cn } from '@repo/ui-shadcn/lib/utils';
import { useSelectedFmt } from '@/store/useSeletedFmt';
import { getEditor } from '@/utils/milkdown-helper';
import AlertPopover from './alert-popover';
import EmojiPopover from './emoji-popover';
import { bars, getActive, getCurrentHeadingLevel, headingOptions, insertBars } from './helper';
import ImagePopover from './image-popover';
import LinkPopover from './link-popover';
import TablePopover from './table-popover';

export default function Toolbar() {
  const [_, get] = useInstance();
  const selectedFmt = useSelectedFmt((state) => state);

  /**
   * 鼠标按下
   */
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const { commands } = getEditor(get);
    if (!commands || id === 'link') return;
    const commandMap = {
      strong: toggleStrongCommand.key,
      italic: toggleEmphasisCommand.key,
      inlineCode: toggleInlineCodeCommand.key,
      strike: toggleStrikethroughCommand.key,
      underline: toggleUnderlineCommand.key,
    };
    const command = commandMap[id as keyof typeof commandMap];
    if (command) commands.call(command);
  };

  /**
   * 标题级别改变
   */
  const handleHeadingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { view, commands } = getEditor(get);
    commands.call(wrapInHeadingCommand.key, Number(e.target.value));
    view.focus();
  };

  /**
   * 插入 Mermaid 图表
   */
  const handleInsertMermaid = () => {
    const { view } = getEditor(get);
    const { state } = view;
    const codeBlockType = state.schema.nodes.fence || state.schema.nodes.code_block;
    if (!codeBlockType) return;
    const template = 'graph TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Action]\n    B -->|No| D[End]';
    const node = codeBlockType.create({ language: 'mermaid' }, state.schema.text(template));
    view.dispatch(state.tr.replaceSelectionWith(node));
    view.focus();
  };

  /**
   * 保存
   */
  const handleSave = () => {
    const { ctx, view } = getEditor(get);
    const serializer = ctx.get(serializerCtx);
    const markdown = serializer(view.state.doc);
    console.log(markdown);
  };

  return (
    <div className="border-b p-2 flex items-center gap-2">
      <select className="h-7 px-2 text-sm border border-gray-200 rounded cursor-pointer hover:bg-gray-50 focus:outline-none" onChange={handleHeadingChange} value={getCurrentHeadingLevel(selectedFmt.headingLevel!)}>
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
            // 超链接使用 Popover 组件，如果有选中文本或者已经是链接，都可以操作
            if (id === 'link') return <LinkPopover key={id} isActive={getActive(id, selectedFmt)} />;
            return <Icon key={id} className={cn('rounded p-1 box-content cursor-pointer hover:bg-gray-200 ', { 'bg-gray-200': getActive(id, selectedFmt) })} size={16} onMouseDown={(e) => handleMouseDown(e, id)} />;
          })}
        </div>
      ))}
      <div className="w-px h-5 bg-gray-200" />
      {/* 插入类工具栏 */}
      {insertBars.map((bar) => (
        <div key={bar.type} className="flex items-center gap-1">
          {bar.content.map(({ id }) => {
            if (id === 'image') return <ImagePopover key={id} />;
            if (id === 'table') return <TablePopover key={id} />;
            if (id === 'emoji') return <EmojiPopover key={id} />;
            if (id === 'alert') return <AlertPopover key={id} />;
            if (id === 'mermaid') return <RiFlowChart key={id} className="rounded p-1 box-content cursor-pointer hover:bg-gray-200" size={16} onMouseDown={(e) => { e.preventDefault(); handleInsertMermaid(); }} />;
            return null;
          })}
        </div>
      ))}
      <div className="w-px h-5 bg-gray-200" />
      <RiSave3Line className="rounded p-1 box-content cursor-pointer hover:bg-gray-200" size={16} onClick={handleSave} />
    </div>
  );
}
