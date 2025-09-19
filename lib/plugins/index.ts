import { installBlockView } from './block-view';
import type { Editor } from '@milkdown/kit/core';
import type { PluginViewFactory } from '../types';
import { installTooltipSelection } from './tooltip-selection';

export function installPlugins(editor: Editor, pluginViewFactory: PluginViewFactory) {
  installTooltipSelection(editor, pluginViewFactory);
  installBlockView(editor, pluginViewFactory);
}
