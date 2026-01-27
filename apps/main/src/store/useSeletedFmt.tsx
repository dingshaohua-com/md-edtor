import { create } from 'zustand';

export interface SelectedFmtType {
  isBold?: boolean;
  isItalic?: boolean;
  isInlineCode?: boolean;
  isLink?: boolean;
  isStrike?: boolean;
}
interface SelectedFmtState extends SelectedFmtType {
  // 可以根据需要扩展更多，如 isStrike 等
  setFmts: (fmts: Partial<Omit<SelectedFmtState, 'setFmts'>>) => void;
}

export const useSelectedFmt = create<SelectedFmtState>((set) => ({
  isBold: false,
  isItalic: false,
  isInlineCode: false,
  isLink: false,
  isStrike: false,
  setFmts: (fmts) => set((state) => ({ ...state, ...fmts })),
}));
