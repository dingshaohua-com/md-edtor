import type { ReactPluginViewUserOptions } from "@prosemirror-adapter/react";

export type PluginViewFactory = (options: ReactPluginViewUserOptions) => any

export interface MdEditorProps {
    className?: string;
    value?: string;
    onChange?: (value: string) => void;
}