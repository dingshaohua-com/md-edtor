import { commonmark } from '@milkdown/kit/preset/commonmark';
import { Editor, rootCtx, defaultValueCtx, EditorStatus } from '@milkdown/kit/core';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { useEffect, useState } from 'react';
import './styles/index.css';
import type { MdEditorProps } from './types';
import { cn } from "./utils"
import { installPlugins } from "./plugins"
import { ProsemirrorAdapterProvider, usePluginViewFactory } from '@prosemirror-adapter/react';
import { gfm } from '@milkdown/kit/preset/gfm'
import { installMarks } from './marks'
// import { nord } from '@milkdown/theme-nord';
import { AppCtxProvider, defaultAppCtx, State } from "./hooks/use-app-ctx"
import { useImmer } from 'use-immer';
import { selectedBlockViewSlice } from './hooks/use-milkdown-context';

const mdContent = `
# 这是一篇文章
这是一篇优秀的文章！

## 简介
每个人都有一颗善良的新
`;

const MdEditor: React.FC<MdEditorProps> = (props) => {
  const [state, setState] = useImmer<State>(defaultAppCtx.state);
  const pluginViewFactory = usePluginViewFactory();
  const { get, loading } = useEditor((root) => {
    const editor = Editor
      .make()
      // .config(nord)
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, mdContent);
      })
      .use(commonmark)
      .use(gfm);
    installMarks(editor);
    installPlugins(editor, pluginViewFactory);
    return editor;
  }, []);


  useEffect(() => {
    if (!loading) {
      // const editor = get();
      console.log('编辑器初始化完成！');
    }
  }, [loading]);
  return <AppCtxProvider state={state} setState={setState}><div className={cn("md-editor h-full w-full", props.className)}><Milkdown /></div></AppCtxProvider>;
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