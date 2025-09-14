import { commonmark } from '@milkdown/kit/preset/commonmark';
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/kit/core';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { useEffect } from 'react';
import './styles/index.css';
import type { MdEditorProps } from './types';
import { cn } from "./utils"
import { installPlugins } from "./plugins"
import { ProsemirrorAdapterProvider, usePluginViewFactory } from '@prosemirror-adapter/react';
import { gfm } from '@milkdown/kit/preset/gfm'
import { installMarks } from './marks'
// import { nord } from '@milkdown/theme-nord';



const MdEditor: React.FC<MdEditorProps> = (props) => {
  const pluginViewFactory = usePluginViewFactory();
  const { get, loading } = useEditor((root) => {
    const editor = Editor
      .make()
      // .config(nord)
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, `hello word`);
      })
      .use(commonmark)
      .use(gfm);
    installMarks(editor);
    installPlugins(editor, pluginViewFactory);
    return editor;
  }, []);


  useEffect(() => {
    if (!loading) {
      const editor = get();
      console.log('编辑器初始化完成！', editor);
    }
  }, [loading]);
  return <div className={cn("md-editor h-full w-full", props.className)}><Milkdown /></div>;
};

export const MdEditorWrapper: React.FC<MdEditorProps> = (props) => {
  return (
    <MilkdownProvider>
      <ProsemirrorAdapterProvider>
      <MdEditor {...props} />
      </ProsemirrorAdapterProvider>
    </MilkdownProvider>
  );
};

export default MdEditorWrapper;