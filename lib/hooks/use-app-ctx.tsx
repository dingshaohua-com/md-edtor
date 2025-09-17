import { createContext, useContext } from 'react';
import type { Updater } from "use-immer";


export type State = {
  selectedBlockView: boolean
}

interface AppCtxProps {
  state: State;
  setState: Updater<State>;

}
type AppCtxProviderProps = AppCtxProps & { children: React.ReactNode };

// 默认值
export const defaultAppCtx: AppCtxProps = {

  state: {
    selectedBlockView: false
  },
  setState: () => { },
};

// 上下文
const AppCtx = createContext<AppCtxProps>(defaultAppCtx);
// 使用者：自定义hook
export const useAppCtx = () => useContext(AppCtx);
// 提供者
export const AppCtxProvider: React.FC<AppCtxProviderProps> = ({ children, ...rest }) => <AppCtx.Provider value={rest}>{children}</AppCtx.Provider>;