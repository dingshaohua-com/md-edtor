import { TooltipProvider } from '@milkdown/kit/plugin/tooltip'
import { toggleEmphasisCommand, toggleStrongCommand } from '@milkdown/kit/preset/commonmark'
import { useInstance } from '@milkdown/react'
import { usePluginViewContext } from '@prosemirror-adapter/react'
import { useEffect, useRef } from 'react'
import { RiBold, RiItalic, RiUnderline, RiStrikethrough, RiEmphasisCn } from '@remixicon/react';
import { cn } from '../../utils';
import { commandsCtx } from '@milkdown/kit/core';
import { toggleStrikethroughCommand } from '@milkdown/kit/preset/gfm';
import { checkMarkActive } from './helper'
import { toggleUnderlineCommand } from '../../marks/underline'

const View = () => {
  const ref = useRef<HTMLDivElement>(null)
  const tooltipProvider = useRef<TooltipProvider>(null)

  const { view, prevState } = usePluginViewContext()
  const [loading, get] = useInstance()

  useEffect(() => {
    const div = ref.current
    if (loading || !div) {
      return;
    }
    tooltipProvider.current = new TooltipProvider({
      content: div,
    })

    return () => {
      tooltipProvider.current?.destroy()
    }
  }, [loading])

  useEffect(() => {
    tooltipProvider.current?.update(view, prevState)
  })

  const editor = get();



  const helper = {
    strong: {
      active: checkMarkActive('strong', editor),
      onClick: () => editor?.action((ctx) => ctx.get(commandsCtx).call(toggleStrongCommand.key))
    },
    emphasis: {
      active: checkMarkActive('emphasis', editor),
      onClick: () => editor?.action((ctx) => ctx.get(commandsCtx).call(toggleEmphasisCommand.key))
    },
    strikeThrough: {
      active: checkMarkActive('strike_through', editor),
      onClick: () => {
        editor?.action((ctx) => ctx.get(commandsCtx).call(toggleStrikethroughCommand.key))
      }
    },
    underline: {
      active: checkMarkActive('underline', editor),
      onClick: () => {
        editor?.action((ctx) => ctx.get(commandsCtx).call(toggleUnderlineCommand.key))
      }
    }
  }

  return (
    <div className="tooltip-selection absolute data-[show=false]:hidden flex items-center justify-center  rounded border border-gray-200 cursor-pointer bg-white box-border p-1 gap-1" ref={ref}>
      <div className={cn('item', { 'bg-gray-300': helper.strong.active })} onClick={helper.strong.onClick} onMouseDown={e => e.preventDefault()}>
        <RiBold size={18} />
      </div>
      <div className={cn('item', { 'bg-gray-300': helper.emphasis.active })} onClick={helper.emphasis.onClick} onMouseDown={e => e.preventDefault()}>
        <RiItalic size={18} />
      </div>
      <div className={cn('item', { 'bg-gray-300': helper.strikeThrough.active })} onClick={helper.strikeThrough.onClick} onMouseDown={e => e.preventDefault()}>
        <RiStrikethrough size={18} />
      </div>
      <div className={cn('item', { 'bg-gray-300': helper.underline.active })} onClick={helper.underline.onClick} onMouseDown={e => e.preventDefault()}>
        <RiUnderline size={18} />
      </div>
    </div>
  )
}


export default View;
