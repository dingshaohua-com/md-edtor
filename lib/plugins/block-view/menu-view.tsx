import {
  wrapInHeadingCommand,
  turnIntoTextCommand
} from '@milkdown/kit/preset/commonmark'
import { useInstance } from '@milkdown/react';
import { commandsCtx } from '@milkdown/kit/core'
import { icons } from "../../utils"
import type { Icon } from '../../types';
import { selectedBlockViewCtx } from '../../hooks/use-milkdown-context';
import { memo } from 'react';
import { callCommand } from '@milkdown/kit/utils';
import { insertTableCommand } from '@milkdown/kit/preset/gfm';

const MenuView = memo(() => {
  const [_, get] = useInstance();
  const editor = get()!;

  // 通过切片的方式，获取milkdown的useContext-selectedBlockView，即当前选中的块（我在父组件存的）
  const selectedBlockViewSlice = editor.ctx.use(selectedBlockViewCtx)
  const selectedBlockView = selectedBlockViewSlice.get()!;

  // 类型断言：确保 selectedBlockView 是 'show' 类型
  type SelectedBlockView = Extract<typeof selectedBlockView, { type: 'show' }>;
  const activeNode = (selectedBlockView as SelectedBlockView).active.node;
  const { type: nodeType, content: nodeContent } = activeNode;

  // 空的段落节点，多发生在新回车增加一个块的操作下发生
  const isBlankParagraph = nodeType.name === 'paragraph' && nodeContent.size === 0;
  console.log(1122, isBlankParagraph);

  const onClick = ({ key }: Icon) => {
    const editor = get()!;

    // 使用方式
    const commands = editor.ctx.get(commandsCtx)
    if (key === 'h1') {
      commands.call(wrapInHeadingCommand.key, 1) // 转换为 h1
    } else if (key === 'h2') {
      commands.call(wrapInHeadingCommand.key, 2) // 转换为 h1
    } else if (key === 'h3') {
      commands.call(wrapInHeadingCommand.key, 3) // 转换为 h1
    } else if (key === 'text') {
      commands.call(turnIntoTextCommand.key) // 转换为正文

    } else if (key === 'table') {
      // 插入默认3x3表格
      editor.action(callCommand(insertTableCommand.key))
    }

  }
  return (
    <div className="slash-menu-block-view p-4 text-black/80 text-sm w-50 transition-opacity shadow-smooth box-border rounded overflow-hidden bg-white">
      <div className="content">
        {/* <fieldset>
          <legend style={{ fontSize: 12 }}>节点专属菜单</legend>
          <div className="slash-view-content-item">
            <RiDeleteBinLine />
            删除标题
          </div>
          <div className="slash-view-content-item">
            <RiDeleteBinLine />
            添加标题
          </div>
        </fieldset> */}

        {/* <div className="slash-view-content-item">
          <RiDeleteBinLine />
          删除
        </div> */}

        <div className="group">
          <div className="title border-b border-black/[0.08] mb-1 pb-1 flex gap-1 items-center">
            转换
          </div>
          <div className="items grid grid-cols-4 gap-1.5">
            {/* [RiH1, RiH2, RiH3, RiTableLine, RiChatQuoteLine, RiSeparator, RiListUnordered, RiListOrdered, RiTodoLine, RiImageLine, RiFunctions, RiCodeLine] */}
            {[icons.h1, icons.h2, icons.h3, icons.text].map((item, index) => (
              <div className="item box-border text-xs cursor-pointer border border-black/[0.08] flex items-center justify-center rounded p-1 hover:bg-black/[0.08]" key={index} onClick={() => onClick(item)}>
                <item.icon size={14} />
              </div>
            ))}
          </div>
        </div>

        <div className="group mt-4">
          <div className="title border-b border-black/[0.08] mb-1 pb-1 flex gap-1 items-center">
            插入
          </div>
          <div className="items grid grid-cols-4 gap-1.5">
            {/* [RiH1, RiH2, RiH3, RiTableLine, RiChatQuoteLine, RiSeparator, RiListUnordered, RiListOrdered, RiTodoLine, RiImageLine, RiFunctions, RiCodeLine] */}
            {[icons.table].map((item, index) => (
              <div className="item box-border text-xs cursor-pointer border border-black/[0.08] flex items-center justify-center rounded p-1 hover:bg-black/[0.08]" key={index} onClick={() => onClick(item)}>
                <item.icon size={14} />
              </div>
            ))}
          </div>
        </div>


      </div>
    </div>
  );
})

MenuView.displayName = 'MenuView';

export default MenuView;
