import type { Updater } from 'use-immer';
import { createContext, useContext } from 'react';

export type State = {
  selectedBlockView: boolean;
};

interface AppCtxProps {
  state: State;
  setState: Updater<State>;
}

// 默认值
export const defaultAppCtx: AppCtxProps = {
  state: {
    selectedBlockView: false,
  },
  setState: () => {},
};

// 上下文
export const AppCtx = createContext<AppCtxProps>(defaultAppCtx);
// 使用者：自定义hook
export const useAppCtx = () => useContext(AppCtx);
