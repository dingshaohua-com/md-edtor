import { RiH1, RiH2, RiH3, RiTableLine, RiChatQuoteLine, RiSeparator, RiListUnordered, RiListOrdered, RiTodoLine, RiImageLine, RiFunctions, RiAddLine, RiCodeLine } from '@remixicon/react';

function MenuView(props: { onHide: () => void }) {
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
            {[RiH1, RiH2, RiH3, RiTableLine, RiChatQuoteLine, RiSeparator, RiListUnordered, RiListOrdered, RiTodoLine, RiImageLine, RiFunctions, RiCodeLine].map((Icon, index) => (
              <div className="item box-border text-xs cursor-pointer border border-black/[0.08] flex items-center justify-center rounded p-1 hover:bg-black/[0.08]" key={index}>
                <Icon size={14} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenuView;
