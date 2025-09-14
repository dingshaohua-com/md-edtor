import type { Editor } from '@milkdown/kit/core';
import { installTooltipSelection } from './tooltip-selection';
import type { PluginViewFactory } from '../types';

export function installPlugins(editor: Editor, pluginViewFactory: PluginViewFactory) {
    installTooltipSelection(editor, pluginViewFactory);
}

