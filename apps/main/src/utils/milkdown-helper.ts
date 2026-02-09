import type {CommandManager } from "@milkdown/kit/core";
import { commandsCtx, editorViewCtx } from "@milkdown/kit/core";
import type { Ctx } from "@milkdown/kit/ctx";
import type { EditorState, Selection } from "@milkdown/kit/prose/state";
import type { EditorView } from "@milkdown/kit/prose/view";

interface EditorInfo {
    ctx: Ctx; 
    view: EditorView; 
    state: EditorState; 
    commands: CommandManager; 
    selection: Selection; 
    from: number;
    to: number
}
export const getEditor = (get: () => { ctx: Ctx } | undefined): EditorInfo => {
  const ctx = get()?.ctx;
  if (!ctx) throw new Error('ctx is not defined');
  const view = ctx.get(editorViewCtx)!;
  const commands = ctx.get(commandsCtx);
  const { state } = view;
  const selection = state.selection;
  const { from, to } = selection;
  return {
      ctx,
      view,
      state,
      commands,
      selection,
      from, 
      to
  }
};