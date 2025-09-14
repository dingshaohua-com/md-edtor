import { markFactory, toggleMark } from '@milkdown/kit/core';
import { keymap } from '@milkdown/kit/prose/keymap';
import { inputRules } from '@milkdown/kit/prose/inputrules';
import { markRule } from '@milkdown/kit/utils';

/* ---------- mark 定义 ---------- */
export const underlineMark = markFactory({
  id: 'underline',
  schema: (ctx) => ({
    group: 'mark',
    parseDOM: [
      { tag: 'u' },
      {
        style: 'text-decoration',
        getAttrs: (value: string) =>
          value === 'underline' ? {} : false,
      },
    ],
    toDOM: () => ['u', { class: 'underline' }],
  }),
});

/* ---------- 输入规则：__text__ ---------- */
export const underlineInputRule = underlineMark.extend(
  (markType) => ({
    prosePlugins: () => [
      inputRules({
        rules: [markRule(/(?:__)([^_]+)(?:__)$/, markType)],
      }),
    ],
  })
);

/* ---------- 快捷键：Mod-u ---------- */
export const underlineKeymap = underlineMark.extend((markType) => ({
  prosePlugins: () => [
    keymap({
      'Mod-u': toggleMark(markType),
    }),
  ],
}));

/* ---------- 一键启用 ---------- */
export const underline = [
  underlineMark,
  underlineInputRule,
  underlineKeymap,
];