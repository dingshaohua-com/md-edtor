import type { ReactPluginViewUserOptions } from '@prosemirror-adapter/react';
import type { RemixiconComponentType } from '@remixicon/react';

export type PluginViewFactory = (options: ReactPluginViewUserOptions) => any;

export interface MdEditorProps {
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export interface Icon {
  key: string,
  label: string,
  icon: RemixiconComponentType
}
