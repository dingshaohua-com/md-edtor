
import { RiH1, RiH2, RiH3, RiTableLine, RiChatQuoteLine, RiSeparator, RiListUnordered, RiListOrdered, RiTodoLine, RiImageLine, RiFunctions, RiAddLine, RiDeleteBinLine, RiCodeLine } from '@remixicon/react';

function MenuView() {
  return (
    <div className="slash-menu-block-view">
      <div className="content">
          <fieldset>
            <legend style={{ fontSize: 12 }}>节点专属菜单</legend>
              <div className="slash-view-content-item">
                <RiDeleteBinLine />
                删除标题
              </div>
              <div className="slash-view-content-item">
                <RiDeleteBinLine />
                添加标题
              </div>
          </fieldset>

        <div className="slash-view-content-item">
          <RiDeleteBinLine />
          删除
        </div>

        <div className="group">
          <div className="title">
            <RiAddLine />
            插入
          </div>
          <div className="items">
            <div className="item">
              <RiH1 />
            </div>
            <div className="item">
              <RiH2 />
            </div>
            <div className="item">
              <RiH3 />
            </div>
            <div className="item">
              <RiTableLine />
            </div>
            <div className="item">
              <RiChatQuoteLine />
            </div>
            <div className="item">
              <RiSeparator />
            </div>
            <div className="item">
              <RiListUnordered />
            </div>
            <div className="item">
              <RiListOrdered />
            </div>
            <div className="item">
              <RiTodoLine />
            </div>
            <div className="item">
              <RiImageLine />
            </div>
            <div className="item">
              <RiFunctions />
            </div>
            <div className="item">
              <RiCodeLine />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenuView;
