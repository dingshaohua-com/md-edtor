import { imageSchema } from '@milkdown/kit/preset/commonmark';
import { useInstance } from '@milkdown/react';
import { RiImageAddLine } from '@remixicon/react';
import { Button } from '@repo/ui-shadcn/components/ui/button';
import { Input } from '@repo/ui-shadcn/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui-shadcn/components/ui/popover';
import { cn } from '@repo/ui-shadcn/lib/utils';
import { useRef, useState } from 'react';
import { getEditor } from '@/utils/milkdown-helper';

type TabType = 'url' | 'upload';

export default function ImagePopover() {
  const [_, get] = useInstance();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabType>('url');
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setUrl('');
    setAlt('');
    setPreview(null);
    setTab('url');
  };

  /**
   * 插入图片节点到编辑器
   */
  const insertImage = (src: string, altText: string) => {
    const { ctx, view } = getEditor(get);
    const imageType = imageSchema.type(ctx);
    const imageNode = imageType.create({
      src,
      alt: altText || '',
      title: altText || '',
    });

    const { state } = view;
    const { from } = state.selection;
    const tr = state.tr.replaceWith(from, from, imageNode);
    view.dispatch(tr);
    view.focus();
  };

  /**
   * URL 方式确认
   */
  const handleUrlConfirm = () => {
    if (!url.trim()) return;
    insertImage(url.trim(), alt.trim());
    resetState();
    setOpen(false);
  };

  /**
   * 本地文件选择
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 校验文件类型
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      setUrl(dataUrl);
    };
    reader.readAsDataURL(file);

    // 重置 input，允许再次选同一文件
    e.target.value = '';
  };

  /**
   * 本地上传确认
   */
  const handleUploadConfirm = () => {
    if (!url) return;
    insertImage(url, alt.trim());
    resetState();
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tab === 'url') handleUrlConfirm();
      else handleUploadConfirm();
    }
  };

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) resetState();
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'url', label: '链接' },
    { key: 'upload', label: '本地上传' },
  ];

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div
          className={cn('rounded p-1 box-content cursor-pointer hover:bg-gray-200')}
          onMouseDown={(e) => e.preventDefault()}
        >
          <RiImageAddLine size={16} />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="flex flex-col gap-3">
          <div className="text-sm font-medium">插入图片</div>

          {/* 自定义 Tab 切换 */}
          <div className="flex gap-1 rounded-md bg-gray-100 p-0.5">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                className={cn(
                  'flex-1 rounded px-3 py-1 text-xs font-medium transition-colors',
                  tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
                )}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* URL 输入 */}
          {tab === 'url' && (
            <div className="flex flex-col gap-2">
              <Input
                placeholder="请输入图片链接地址"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <Input
                placeholder="图片描述（可选）"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          )}

          {/* 本地上传 */}
          {tab === 'upload' && (
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {preview ? (
                <div className="relative rounded border border-gray-200 overflow-hidden">
                  <img src={preview} alt="预览" className="w-full max-h-40 object-contain bg-gray-50" />
                  <button
                    type="button"
                    className="absolute top-1 right-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white hover:bg-black/70"
                    onClick={() => {
                      setPreview(null);
                      setUrl('');
                    }}
                  >
                    移除
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="flex flex-col items-center justify-center gap-1 rounded border-2 border-dashed border-gray-200 py-6 text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <RiImageAddLine size={24} />
                  <span className="text-xs">点击选择图片</span>
                </button>
              )}
              <Input
                placeholder="图片描述（可选）"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button
              size="sm"
              onClick={tab === 'url' ? handleUrlConfirm : handleUploadConfirm}
              disabled={!url.trim()}
            >
              确定
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
