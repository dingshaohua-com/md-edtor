import { Editor } from "@milkdown/kit/core";
import { View } from "./view";
import { block } from "@milkdown/kit/plugin/block";
import { PluginViewFactory } from "../../types";
import type { Ctx } from "@milkdown/kit/ctx";
import { selectedBlockViewSlice } from "../../hooks/use-milkdown-context";

export const installBlockView = (
  editor: Editor,
  pluginViewFactory: PluginViewFactory
) => {
  editor
    .config((ctx: Ctx) => {
      ctx.inject(selectedBlockViewSlice);
      ctx.set(block.key, {
        view: pluginViewFactory({
          component: View,
        }),
      });
    })
    .use(block);
};
