import { $command, $mark } from '@milkdown/kit/utils';
import { toggleMark } from '@milkdown/kit/prose/commands';

/* ------------- mark 定义 ------------- */
export const underlineMark = $mark('underline', () => ({
  group: 'mark',
  parseDOM: [{ tag: 'u' }],
  toDOM: () => ['u', { class: 'underline' }],
  parseMarkdown: {
    match: () => false, // 暂时禁用 markdown 解析
    runner: () => {},
  },
  toMarkdown: {
    match: () => false, // 暂时禁用 markdown 输出
    runner: () => {},
  },
}));

/* ------------- 切换命令 ------------- */
export const toggleUnderlineCommand = $command('ToggleUnderline', (ctx) => () => {
  return toggleMark(underlineMark.type(ctx));
});

/* ------------- 一键启用 ------------- */
export const underline = [underlineMark, toggleUnderlineCommand];
