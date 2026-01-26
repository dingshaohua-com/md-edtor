import { RiBold, RiEmphasisCn, RiItalic, RiStrikethrough, RiUnderline } from '@remixicon/react';

export const bars = [
  {
    type: 'button',
    content: [
      {
        id: 'strong',
        icon: RiBold,
        // action: (editor: Editor) => editor.action((ctx) => ctx.get(commandsCtx).call(toggleStrongCommand.key)),
        // isActive: (editor: Editor) => checkMarkActive('strong', editor),
        tooltip: '粗体',
      },
      {
        id: 'emphasis',
        icon: RiItalic,
        // action: (editor: Editor) => editor.action((ctx) => ctx.get(commandsCtx).call(toggleEmphasisCommand.key)),
        // isActive: (editor: Editor) => checkMarkActive('emphasis', editor),
        tooltip: '斜体',
      },
      {
        id: 'strike_through',
        icon: RiStrikethrough,
        // action: (editor: Editor) => editor.action((ctx) => ctx.get(commandsCtx).call(toggleStrikethroughCommand.key)),
        // isActive: (editor: Editor) => checkMarkActive('strike_through', editor),
        tooltip: '删除线',
      },
    ],
  },
];
