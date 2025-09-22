import { useEffect, useState } from 'react';
import { useInstance } from '@milkdown/react';
import { effect, useSignal } from '@preact-signals/safe-react';
import { blockServiceInstance, type BlockServiceMessageType } from '@milkdown/kit/plugin/block';

export const useBlockNotify = () => {
  const [loading, get] = useInstance();
  const [msg, setMsg] = useState<BlockServiceMessageType | null>(null);

  useEffect(() => {
    const editor = get()!;
    if (!editor) return;
    const service = editor.ctx.get(blockServiceInstance.key);
    // 保存原始的 bind 方法
    const originalBind = service.bind;
    // 重写 bind 方法
    service.bind = (ctx, notify) => {
      // 包装 notify 函数
      const wrappedNotify = (message: BlockServiceMessageType) => {
        setMsg(message);
        // 调用原始 notify
        notify(message);
      };
      // 调用原始 bind
      return originalBind.call(service, ctx, wrappedNotify);
    };
  }, [loading, get]);
  return { msg };
};

export const useBlockNotifySignal = () => {
  const [loading, get] = useInstance();
  const msg = useSignal<BlockServiceMessageType | null>(null);

  useEffect(() => {
    const editor = get()!;
    if (!editor) return;
    const service = editor.ctx.get(blockServiceInstance.key);
    // 保存原始的 bind 方法
    const originalBind = service.bind;
    // 重写 bind 方法
    service.bind = (ctx, notify) => {
      // 包装 notify 函数
      const wrappedNotify = (message: BlockServiceMessageType) => {
        msg.value = message;
        // console.log('重新赋值了');
        
        // 调用原始 notify
        notify(message);
      };
      // 调用原始 bind
      return originalBind.call(service, ctx, wrappedNotify);
    };
  }, [loading, get, msg]);

  effect(() => {
    console.log('currentTime11 变化了：', msg);
  });
  return { msg };
};
