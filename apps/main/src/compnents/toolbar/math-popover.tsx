import { TextSelection, type Transaction } from '@milkdown/kit/prose/state';
import { useInstance } from '@milkdown/react';
import { RiOmega } from '@remixicon/react';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui-shadcn/components/ui/popover';
import { cn } from '@repo/ui-shadcn/lib/utils';
import katex from 'katex';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getEditor } from '@/utils/milkdown-helper';

/* ------------------------------------------------------------------ */
/*  预设公式                                                           */
/* ------------------------------------------------------------------ */

const PRESETS = [
  { latex: '\\frac{a}{b}', label: '分数' },
  { latex: 'x^{n}', label: '幂' },
  { latex: 'x_{i}', label: '下标' },
  { latex: '\\sqrt{x}', label: '根号' },
  { latex: '\\sum_{i=1}^{n} x_i', label: '求和' },
  { latex: '\\int_{a}^{b} f(x)\\,dx', label: '积分' },
  { latex: '\\lim_{x \\to \\infty} f(x)', label: '极限' },
  { latex: '\\prod_{i=1}^{n} x_i', label: '连乘' },
  { latex: '\\frac{\\partial f}{\\partial x}', label: '偏导' },
  { latex: '\\vec{v}', label: '向量' },
  { latex: '\\alpha, \\beta, \\gamma', label: '希腊字母' },
  { latex: 'a \\neq b', label: '不等于' },
  { latex: 'a \\leq b', label: '小于等于' },
  { latex: '\\log_a b', label: '对数' },
  { latex: '\\binom{n}{k}', label: '组合数' },
  { latex: '\\infty', label: '无穷' },
] as const;

const BLOCK_PRESETS = [
  {
    latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    label: '求根公式',
  },
  {
    latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
    label: '矩阵',
  },
  {
    latex: '\\begin{cases} x + y = 1 \\\\ x - y = 0 \\end{cases}',
    label: '方程组',
  },
  {
    latex: 'e^{i\\pi} + 1 = 0',
    label: '欧拉公式',
  },
  {
    latex: 'E = mc^{2}',
    label: '质能方程',
  },
  {
    latex: '\\nabla \\times \\vec{E} = -\\frac{\\partial \\vec{B}}{\\partial t}',
    label: '麦克斯韦',
  },
] as const;

/* ------------------------------------------------------------------ */
/*  KaTeX 预览渲染                                                     */
/* ------------------------------------------------------------------ */

function KatexPreview({ latex, displayMode = false }: { latex: string; displayMode?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    try {
      katex.render(latex, ref.current, {
        throwOnError: false,
        displayMode,
      });
    } catch {
      if (ref.current) ref.current.textContent = latex;
    }
  }, [latex, displayMode]);

  return <span ref={ref} />;
}

/* ------------------------------------------------------------------ */
/*  组件                                                               */
/* ------------------------------------------------------------------ */

type MathMode = 'inline' | 'block';

export default function MathPopover() {
  const [_, get] = useInstance();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<MathMode>('inline');
  const [customLatex, setCustomLatex] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  /** 插入公式节点 */
  const insertMath = useCallback(
    (latex: string, insertMode: MathMode) => {
      const { view, state } = getEditor(get);

      if (insertMode === 'block') {
        const type = state.schema.nodes.math_block;
        if (!type) return;
        const node = type.create(null, latex ? [state.schema.text(latex)] : undefined);

        const { from } = state.selection;
        const $from = state.doc.resolve(from);
        const parentBlock = $from.parent;

        let tr: Transaction;
        if (parentBlock.type.name === 'paragraph' && parentBlock.content.size === 0) {
          const blockStart = $from.before($from.depth);
          const blockEnd = $from.after($from.depth);
          tr = state.tr.replaceWith(blockStart, blockEnd, node);
        } else {
          const insertPos = $from.after($from.depth);
          tr = state.tr.replaceWith(insertPos, insertPos, node);
        }
        view.dispatch(tr);
      } else {
        const type = state.schema.nodes.math_inline;
        if (!type) return;
        const node = type.create(null, latex ? [state.schema.text(latex)] : undefined);
        const { tr } = state;
        tr.replaceSelectionWith(node, false);
        // 光标移到公式后面
        const pos = tr.selection.from;
        tr.setSelection(TextSelection.create(tr.doc, pos));
        view.dispatch(tr);
      }

      view.focus();
      setOpen(false);
      setCustomLatex('');
    },
    [get],
  );

  const handleCustomInsert = useCallback(() => {
    if (!customLatex.trim()) return;
    insertMath(customLatex, mode);
  }, [customLatex, mode, insertMath]);

  const currentPresets = mode === 'inline' ? PRESETS : BLOCK_PRESETS;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn('rounded p-1 box-content cursor-pointer hover:bg-gray-200')}
          onMouseDown={(e) => e.preventDefault()}
        >
          <RiOmega size={16} />
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="start">
        {/* 模式切换 */}
        <div className="flex border-b">
          <button
            type="button"
            className={cn(
              'flex-1 py-2 text-xs font-medium transition-colors',
              mode === 'inline'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700',
            )}
            onClick={() => setMode('inline')}
          >
            行内公式
          </button>
          <button
            type="button"
            className={cn(
              'flex-1 py-2 text-xs font-medium transition-colors',
              mode === 'block'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700',
            )}
            onClick={() => setMode('block')}
          >
            块级公式
          </button>
        </div>

        {/* 预设网格 */}
        <div className="p-2">
          <div className="text-[11px] text-gray-400 mb-1.5 px-1">常用公式</div>
          <div className={cn(
            'grid gap-1.5',
            mode === 'inline' ? 'grid-cols-4' : 'grid-cols-3',
          )}>
            {currentPresets.map(({ latex, label }) => (
              <button
                key={latex}
                type="button"
                className="flex flex-col items-center gap-1 rounded-md px-1 py-2 transition-colors hover:bg-gray-100 border border-transparent hover:border-gray-200 group"
                title={label}
                onClick={() => insertMath(latex, mode)}
              >
                <span className="text-sm leading-tight overflow-hidden max-w-full [&_.katex]:text-[11px]">
                  <KatexPreview latex={latex} displayMode={false} />
                </span>
                <span className="text-[10px] text-gray-400 group-hover:text-gray-600 truncate max-w-full">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 自定义输入 */}
        <div className="border-t px-2 py-2.5">
          <div className="text-[11px] text-gray-400 mb-1.5 px-1">自定义公式</div>
          <div className="flex gap-1.5">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 h-7 px-2 text-xs border border-gray-200 rounded-md outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 font-mono"
              placeholder="输入 LaTeX 公式..."
              value={customLatex}
              onChange={(e) => setCustomLatex(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCustomInsert();
                }
              }}
            />
            <button
              type="button"
              className="h-7 px-3 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              disabled={!customLatex.trim()}
              onClick={handleCustomInsert}
            >
              插入
            </button>
          </div>
          {/* 实时预览 */}
          {customLatex.trim() && (
            <div className="mt-2 px-2 py-1.5 bg-gray-50 rounded-md text-center min-h-[28px] flex items-center justify-center [&_.katex]:text-sm">
              <KatexPreview latex={customLatex} displayMode={mode === 'block'} />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
