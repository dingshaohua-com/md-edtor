import { create } from 'zustand';

export interface SelectedFmtType {
  isBold?: boolean;
  isItalic?: boolean;
  isInlineCode?: boolean;
  isLink?: boolean;
  isStrike?: boolean;
  isUnderline?: boolean;
  isBulletList?: boolean; // 是否在无序列表中
  isOrderedList?: boolean; // 是否在有序列表中
  headingLevel?: number; // 0 表示正文，2/3/4 表示对应标题级别
  hasSelection?: boolean; // 是否有选中文本
  linkHref?: string; // 当前选中链接的 href
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
  isUnderline: false,
  isBulletList: false,
  isOrderedList: false,
  headingLevel: 0,
  hasSelection: false,
  linkHref: '',
  setFmts: (fmts) => set((state) => ({ ...state, ...fmts })),
}));
