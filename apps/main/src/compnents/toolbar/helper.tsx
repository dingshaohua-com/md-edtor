
import { RiBold, RiCodeAiLine, RiEmphasisCn, RiItalic, RiLink, RiStrikethrough, RiUnderline } from '@remixicon/react';
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
  };
  return Boolean(fmtMap[id as keyof typeof fmtMap]);
};

