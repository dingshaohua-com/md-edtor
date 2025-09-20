import {
  wrapInHeadingCommand,
  turnIntoTextCommand
} from '@milkdown/kit/preset/commonmark'
import { RiAddLine } from '@remixicon/react';
import { useInstance } from '@milkdown/react';
import { commandsCtx } from '@milkdown/kit/core'
import { icons } from "../../utils"
import type { Icon } from '../../types';

function MenuView(props: { onHide: () => void }) {
  const [_, get] = useInstance();


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

    }

  }
  return (
    <div className="slash-menu-block-view p-2 text-black/80 text-sm w-30 transition-opacity shadow-smooth box-border rounded overflow-hidden bg-white">
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
          <div className="title border-b border-black/[0.08] mb-2.5 pb-1 flex gap-1 items-center">
            <RiAddLine />
            插入
          </div>
          <div className="items grid grid-cols-3 gap-1.5">
            {/* [RiH1, RiH2, RiH3, RiTableLine, RiChatQuoteLine, RiSeparator, RiListUnordered, RiListOrdered, RiTodoLine, RiImageLine, RiFunctions, RiCodeLine] */}
            {[icons.h1, icons.h2, icons.h3, icons.text].map((item, index) => (
              <div className="item box-border text-xs cursor-pointer border border-black/[0.08] flex items-center justify-center rounded p-1 hover:bg-black/[0.08]" key={index} onClick={() => onClick(item)}>
                <item.icon size={14} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenuView;
