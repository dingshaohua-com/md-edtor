import { commonmark } from '@milkdown/kit/preset/commonmark';
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/kit/core';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { useEffect } from 'react';

const MdEditor: React.FC = () => {
    
    
  const { get, loading } = useEditor((root) =>
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, `hello word111222`);
      })
      .use(commonmark)
  );

  useEffect(() => {
    if (!loading) {
      const editor = get();
      console.log('编辑器初始化完成！', editor);
    }
  }, [loading]);
  return <Milkdown />;
};

export const MdEditorWrapper: React.FC = () => {
  return (
    <MilkdownProvider>
      <MdEditor />
    </MilkdownProvider>
  );
};

export default MdEditorWrapper;