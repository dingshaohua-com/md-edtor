import { createSlice } from '@milkdown/kit/ctx'

// 创建一个共享的 context slice 用于插件间通信
export const selectedBlockViewSlice = createSlice(false, 'selectedBlockView')


// 事件类型
export const PLUGIN_EVENTS = {
  BLOCK_VIEW_CLICKED: 'block-view-clicked',
  HIDE_TOOLTIP_SELECTION: 'hide-tooltip-selection',
} as const
