import { create } from 'zustand';

export interface SelectedFmtType {
  isBold?: boolean;
  isItalic?: boolean;
  isInlineCode?: boolean;
  isLink?: boolean;
  isStrike?: boolean;
  headingLevel?: number; // 0 表示正文，2/3/4 表示对应标题级别
}
interface SelectedFmtState extends SelectedFmtType {
  setFmts: (fmts: Partial<Omit<SelectedFmtState, 'setFmts'>>) => void;
}

export const useSelectedFmt = create<SelectedFmtState>((set) => ({
  isBold: false,
  isItalic: false,
  isInlineCode: false,
  isLink: false,
  isStrike: false,
  headingLevel: 0,
  setFmts: (fmts) => set((state) => ({ ...state, ...fmts })),
}));
