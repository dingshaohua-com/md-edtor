import { editorViewCtx } from '@milkdown/kit/core';
import type { Ctx } from '@milkdown/kit/ctx';
import { emphasisSchema, inlineCodeSchema, linkSchema, strongSchema } from '@milkdown/kit/preset/commonmark';
import { strikethroughSchema } from '@milkdown/kit/preset/gfm';
import type { SelectedFmtType } from '@/store/useSeletedFmt';


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

  // 3. 执行判断（逻辑和你之前的一致）
  const isBold = empty ? !!boldType.isInSet(state.storedMarks || state.selection.$from.marks()) : state.doc.rangeHasMark(from, to, boldType);
  console.log('是否加粗：', isBold);

  const isItalic = empty ? !!emphasisType.isInSet(state.storedMarks || state.selection.$from.marks()) : state.doc.rangeHasMark(from, to, emphasisType);
  const isInlineCode = empty ? !!inlineCodeType.isInSet(state.storedMarks || state.selection.$from.marks()) : state.doc.rangeHasMark(from, to, inlineCodeType);
  const isLink = empty ? !!linkType.isInSet(state.storedMarks || state.selection.$from.marks()) : state.doc.rangeHasMark(from, to, linkType);
  const isStrike = empty ? !!strikeType.isInSet(state.storedMarks || state.selection.$from.marks()) : state.doc.rangeHasMark(from, to, strikeType);
  return { isBold, isItalic, isInlineCode, isLink, isStrike };
}
