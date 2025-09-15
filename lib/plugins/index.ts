import type { Editor } from '@milkdown/kit/core';
import { installTooltipSelection } from './tooltip-selection';
import type { PluginViewFactory } from '../types';
import { installBlockView } from './block-view';

export function installPlugins(editor: Editor, pluginViewFactory: PluginViewFactory) {
    installTooltipSelection(editor, pluginViewFactory);
    installBlockView(editor, pluginViewFactory);
}

