import View from './view';
import type { Ctx } from '@milkdown/kit/ctx';
import type { Editor } from '@milkdown/kit/core';
import type { PluginViewFactory } from '../../types';
import { tooltipFactory } from '@milkdown/kit/plugin/tooltip';
// import { selectedBlockViewSlice } from '../../hooks/use-milkdown-context'

export const tooltip = tooltipFactory('Text');

export const installTooltipSelection = (editor: Editor, pluginViewFactory: PluginViewFactory) => {
  editor
    .config((ctx: Ctx) => {
      // ctx.inject(selectedBlockViewSlice);
      ctx.set(tooltip.key, {
        view: pluginViewFactory({
          component: View,
        }),
      });
    })
    .use(tooltip);
};
