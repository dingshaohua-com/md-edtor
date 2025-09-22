import { createSlice } from '@milkdown/kit/ctx';
import type { BlockServiceMessageType } from '@milkdown/kit/plugin/block';

// 创建一个共享的 context slice 用于插件间通信
export const selectedBlockViewCtx= createSlice<BlockServiceMessageType|null>(null, 'selectedBlockView');

// 事件类型
export const PLUGIN_EVENTS = {
  BLOCK_VIEW_CLICKED: 'block-view-clicked',
  HIDE_TOOLTIP_SELECTION: 'hide-tooltip-selection',
} as const;
