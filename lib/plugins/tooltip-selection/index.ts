import View from './view';
import type { Editor } from '@milkdown/kit/core';
import { tooltipFactory } from '@milkdown/kit/plugin/tooltip'
import type { PluginViewFactory } from '../../types';
import type { Ctx } from "@milkdown/kit/ctx";
import { selectedBlockViewSlice } from '../../hooks/use-milkdown-context'

export const tooltip = tooltipFactory('Text');

export const installTooltipSelection = (editor: Editor, pluginViewFactory: PluginViewFactory) => {
  
  editor
    .config((ctx: Ctx) => {
      ctx.inject(selectedBlockViewSlice);
    //  selectedBlockViewSlice.on((val) => {
    //   console.log('选中块变了', val);
    // });

    // const slice = ctx.get(selectedBlockViewSlice)
    // console.log(11122, slice.on);
    
      ctx.set(tooltip.key, {
        view: pluginViewFactory({
          component: View,
        }),
      });
    })
    .use(tooltip);
};
