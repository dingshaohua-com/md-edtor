import { RiBold, RiCodeAiLine, RiEmphasisCn, RiItalic, RiLink, RiStrikethrough, RiUnderline } from '@remixicon/react';

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
      }
    ],
  },
];
