import View from './view';
import type { Editor } from '@milkdown/kit/core';
import { tooltipFactory } from '@milkdown/kit/plugin/tooltip'
import type { PluginViewFactory } from '../../types';

export const tooltip = tooltipFactory('Text');

export const installTooltipSelection = (editor: Editor, pluginViewFactory: PluginViewFactory) => {
  editor
    .config((ctx: any) => {
      ctx.set(tooltip.key, {
        view: pluginViewFactory({
          component: View,
        }),
      });
    })
    .use(tooltip);
};
