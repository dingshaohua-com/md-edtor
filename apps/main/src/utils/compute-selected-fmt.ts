import { editorViewCtx } from '@milkdown/kit/core';
import type { Ctx } from '@milkdown/kit/ctx';
import { bulletListSchema, emphasisSchema, headingSchema, inlineCodeSchema, linkSchema, orderedListSchema, strongSchema } from '@milkdown/kit/preset/commonmark';
import { strikethroughSchema } from '@milkdown/kit/preset/gfm';
import type { MarkType } from '@milkdown/kit/prose/model';
import type { EditorState } from '@milkdown/kit/prose/state';
import { underlineSchema } from '@repo/milkdown-plugin/underline.ts';
import type { SelectedFmtType } from '@/store/useSeletedFmt';

const getLinkHref = (empty: boolean, state: EditorState, from: number, to: number, linkType: MarkType) => {
  // 获取当前链接的 href
  let linkHref = '';
  if (empty) {
    // 光标模式：从 storedMarks 或当前位置的 marks 获取
    const marks = state.storedMarks || state.selection.$from.marks();
    const linkMark = linkType.isInSet(marks);
    console.log('linkMark1', linkMark);

    if (linkMark) {
      linkHref = linkMark.attrs.href || '';
    }
  } else {
    // 选区模式：遍历选区内的节点查找链接 mark
    state.doc.nodesBetween(from, to, (node) => {
      if (linkHref) return false; // 找到后停止遍历
      const linkMark = linkType.isInSet(node.marks);
      if (linkMark) {
        linkHref = linkMark.attrs.href || '';
      }
    });
  }
  return linkHref;
};

export default function (ctx: Ctx): SelectedFmtType {
  // 1. 获取 View 实例
  const view = ctx.get(editorViewCtx);
  const { state } = view;
  const { from, to, empty } = state.selection;

  // 2. 获取 Mark 类型（例如加粗）
  const boldType = strongSchema.type(ctx);
  const emphasisType = emphasisSchema.type(ctx);
  const inlineCodeType = inlineCodeSchema.type(ctx);
  const linkType = linkSchema.type(ctx);
  const strikeType = strikethroughSchema.type(ctx);
  const underlineType = underlineSchema.type(ctx);
  const headingType = headingSchema.type(ctx);

  // 3. 执行判断（逻辑和你之前的一致）
  const isBold = empty ? !!boldType.isInSet(state.storedMarks || state.selection.$from.marks()) : state.doc.rangeHasMark(from, to, boldType);
  const isItalic = empty ? !!emphasisType.isInSet(state.storedMarks || state.selection.$from.marks()) : state.doc.rangeHasMark(from, to, emphasisType);
  const isInlineCode = empty ? !!inlineCodeType.isInSet(state.storedMarks || state.selection.$from.marks()) : state.doc.rangeHasMark(from, to, inlineCodeType);
  const isLink = empty ? !!linkType.isInSet(state.storedMarks || state.selection.$from.marks()) : state.doc.rangeHasMark(from, to, linkType);
  const isStrike = empty ? !!strikeType.isInSet(state.storedMarks || state.selection.$from.marks()) : state.doc.rangeHasMark(from, to, strikeType);
  const isUnderline = empty ? !!underlineType.isInSet(state.storedMarks || state.selection.$from.marks()) : state.doc.rangeHasMark(from, to, underlineType);

  // 4. 获取当前块的标题级别
  const $from = state.selection.$from;
  const parentNode = $from.parent;
  const headingLevel = parentNode.type === headingType ? (parentNode.attrs.level as number) : 0;

  // 4.1 检测当前是否在列表中（遍历父级节点）
  const bulletListType = bulletListSchema.type(ctx);
  const orderedListType = orderedListSchema.type(ctx);
  let isBulletList = false;
  let isOrderedList = false;
  for (let depth = $from.depth; depth >= 0; depth--) {
    const node = $from.node(depth);
    if (node.type === bulletListType) {
      isBulletList = true;
      break;
    }
    if (node.type === orderedListType) {
      isOrderedList = true;
      break;
    }
  }

  // 5. 获取当前链接的 href
  const linkHref = getLinkHref(empty, state, from, to, linkType);

  // 6. 是否有选中文本
  const hasSelection = !empty;

  return { isBold, isItalic, isInlineCode, isLink, isStrike, isUnderline, isBulletList, isOrderedList, headingLevel, hasSelection, linkHref };
}
