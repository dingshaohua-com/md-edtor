import View from './view';
import type { Editor } from '@milkdown/kit/core';
import { tooltipFactory } from '@milkdown/kit/plugin/tooltip'
import type { PluginViewFactory } from '../../types';
import type { Ctx } from "@milkdown/kit/ctx";

export const tooltip = tooltipFactory('Text');

export const installTooltipSelection = (editor: Editor, pluginViewFactory: PluginViewFactory) => {
  editor
    .config((ctx: Ctx) => {
      ctx.set(tooltip.key, {
        view: pluginViewFactory({
          component: View,
        }),
      });
    })
    .use(tooltip);
};
