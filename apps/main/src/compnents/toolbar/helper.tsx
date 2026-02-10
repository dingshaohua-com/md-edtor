
import { RiAlertLine, RiBold, RiCodeAiLine, RiEmojiStickerLine, RiFlowChart, RiImageAddLine, RiItalic, RiLink, RiListOrdered2, RiListUnordered, RiOmega, RiStrikethrough, RiTable3, RiUnderline } from '@remixicon/react';
import type { SelectedFmtType } from "@/store/useSeletedFmt";



export const bars = [
  {
    type: 'button',
    content: [
      {
        id: 'strong',
        icon: RiBold,
        tooltip: '粗体',
      },
      {
        id: 'italic',
        icon: RiItalic,
        tooltip: '斜体',
      },
      {
        id: 'inlineCode',
        icon: RiCodeAiLine,
        tooltip: '代码行',
      },
      {
        id: 'link',
        icon: RiLink,
        tooltip: '链接',
      },
      {
        id: 'strike',
        icon: RiStrikethrough,
        tooltip: '删除线',
      },
      {
        id: 'underline',
        icon: RiUnderline,
        tooltip: '下划线',
      },
    ],
  },
];

/** 列表类工具栏 */
export const listBars = [
  {
    type: 'list',
    content: [
      {
        id: 'bulletList',
        icon: RiListUnordered,
        tooltip: '无序列表',
      },
      {
        id: 'orderedList',
        icon: RiListOrdered2,
        tooltip: '有序列表',
      },
    ],
  },
];

/** 插入类工具栏 */
export const insertBars = [
  {
    type: 'insert',
    content: [
      {
        id: 'image',
        icon: RiImageAddLine,
        tooltip: '插入图片',
      },
      {
        id: 'table',
        icon: RiTable3,
        tooltip: '插入表格',
      },
      {
        id: 'emoji',
        icon: RiEmojiStickerLine,
        tooltip: '插入表情',
      },
      {
        id: 'alert',
        icon: RiAlertLine,
        tooltip: '插入提示容器',
      },
      {
        id: 'math',
        icon: RiOmega,
        tooltip: '插入公式',
      },
      {
        id: 'mermaid',
        icon: RiFlowChart,
        tooltip: '插入 Mermaid 图表',
      },
    ],
  },
];

export const headingOptions = [
  { value: 0, label: '正文' },
  { value: 1, label: '一级标题' },
  { value: 2, label: '二级标题' },
  { value: 3, label: '三级标题' },
  { value: 4, label: '四级标题' },
];

export const getCurrentHeadingLevel = (headingLevel: number) => {
  return headingOptions.some((opt) => opt.value === headingLevel) ? headingLevel : 0;
};


export const getActive = (id: string, selectedFmt:SelectedFmtType ) => {
  const fmtMap = {
    strong: selectedFmt.isBold,
    italic: selectedFmt.isItalic,
    inlineCode: selectedFmt.isInlineCode,
    link: selectedFmt.isLink,
    strike: selectedFmt.isStrike,
    underline: selectedFmt.isUnderline,
    bulletList: selectedFmt.isBulletList,
    orderedList: selectedFmt.isOrderedList,
  };
  return Boolean(fmtMap[id as keyof typeof fmtMap]);
};

