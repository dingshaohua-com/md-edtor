# 表格
即便是前边我们设置了 @tailwindcss/typography，为md增加了样式。但是这对表格来说是远远不够的：它需要能对行和列单元格的 增加和删除！

所以我们需要使用 milkdown内置的插件
```jsx
import { tableBlock } from '@milkdown/kit/component/table-block';

useEditor((root) =>
    Editor.make()
        .use(tableBlock)
        // ...
    );
```

然后将如下样式导入
```css
@import '@milkdown/kit/prose/tables/style/tables.css';

.milkdown-table-block {
  --crepe-color-background: #fffdfb;
  --crepe-color-on-background: #1f1b16;
  --crepe-color-surface: #fff8f4;
  --crepe-color-surface-low: #fff1e5;
  --crepe-color-on-surface: #201b13;
  --crepe-color-on-surface-variant: #4f4539;
  --crepe-color-outline: #817567;
  --crepe-color-primary: #805610;
  --crepe-color-secondary: #fbdebc;
  --crepe-color-on-secondary: #271904;
  --crepe-color-inverse: #362f27;
  --crepe-color-on-inverse: #fcefe2;
  --crepe-color-inline-code: #ba1a1a;
  --crepe-color-error: #ba1a1a;
  --crepe-color-hover: #f9ecdf;
  --crepe-color-selected: #ede0d4;
  --crepe-color-inline-area: #e4d8cc;

  --crepe-font-title: Georgia, Cambria, 'Times New Roman', Times, serif;
  --crepe-font-default: 'Open Sans', Arial, Helvetica, sans-serif;
  --crepe-font-code: Fira Code, Menlo, Monaco, 'Courier New', Courier, monospace;

  --crepe-shadow-1: 0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3);
  --crepe-shadow-2: 0px 2px 6px 2px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3);

  display: block;
  margin: 4px 0;

  th,
  td {
    border: 1px solid color-mix(in srgb, var(--crepe-color-outline), transparent 80%);
    padding: 4px 16px;

    .ProseMirror-selectednode {
      background-color: transparent !important;
    }

    &:has(.ProseMirror-selectednode) {
      outline: 1px solid var(--crepe-color-primary);
      outline-offset: -1px;
    }
  }

  .selectedCell {
    &::after {
      background-color: var(--crepe-color-selected);
      opacity: 0.4;
    }

    ::selection {
      background: transparent;
    }
  }

  .drag-preview {
    background-color: var(--crepe-color-surface);
    opacity: 0.4;
    position: absolute;
    z-index: 100;
    display: flex;
    flex-direction: column;
    outline: 1px solid var(--crepe-color-primary);
    outline-offset: -1px;

    &[data-show='false'] {
      display: none;
    }

    th,
    td {
      &:has(.ProseMirror-selectednode) {
        outline: none;
      }
    }
  }

  .handle {
    position: absolute;
    font-size: 14px;
    transition: opacity ease-in-out 0.2s;

    &[data-show='false'] {
      opacity: 0;
    }
  }

  svg {
    fill: var(--crepe-color-outline);
  }

  .cell-handle {
    z-index: 50;
    left: -999px;
    top: -999px;
    cursor: grab;
    background-color: var(--crepe-color-surface);
    color: var(--crepe-color-outline);
    border-radius: 100px;
    box-shadow: var(--crepe-shadow-1);
    transition: background-color 0.2s ease-in-out;

    &:hover {
      background-color: var(--crepe-color-hover);
    }

    &:has(.button-group:hover) {
      background-color: var(--crepe-color-surface);
    }

    &[data-role='col-drag-handle'] {
      transform: translateY(50%);
      padding: 0 6px;
      width: 28px;
      height: 16px;
    }

    &[data-role='row-drag-handle'] {
      transform: translateX(50%);
      padding: 6px 0;
      width: 16px;
      height: 28px;
    }

    .button-group {
      position: absolute;
      transform: translateX(-50%);
      left: 50%;
      top: -52px;
      display: flex;
      background-color: var(--crepe-color-surface);
      border-radius: 8px;
      box-shadow: var(--crepe-shadow-1);

      &::after {
        content: '';
        position: absolute;
        bottom: -8px;
        height: 8px;
        background-color: transparent;
        width: 100%;
      }

      &[data-show='false'] {
        display: none;
      }

      button {
        cursor: pointer;
        margin: 6px;
        padding: 4px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 4px;

        svg {
          width: 24px;
          height: 24px;
        }

        &:hover {
          border-radius: 8px;
          background-color: var(--crepe-color-hover);
        }

        &:active {
          background: var(--crepe-color-selected);
        }
      }
    }

    &:hover {
      opacity: 1;
    }
  }

  .line-handle {
    z-index: 20;
    background-color: var(--crepe-color-primary);

    &:hover {
      opacity: 1;
    }

    .add-button {
      cursor: pointer;
      background-color: var(--crepe-color-surface);
      color: var(--crepe-color-outline);
      border-radius: 100px;
      box-shadow: var(--crepe-shadow-1);
      transition: background-color 0.2s ease-in-out;

      svg {
        width: 16px;
        height: 16px;
      }

      &:hover {
        background-color: var(--crepe-color-hover);
      }

      &:active {
        background: var(--crepe-color-selected);
      }
    }

    &[data-role='x-line-drag-handle'] {
      height: 1px;
      z-index: 2;

      .add-button {
        position: absolute;
        transform: translateX(-50%) translateY(-50%);
        padding: 6px 0;
        width: 16px;
        height: 28px;
      }
    }

    &[data-role='y-line-drag-handle'] {
      width: 1px;
      z-index: 1;

      .add-button {
        position: absolute;
        transform: translateY(-50%) translateX(-50%);
        padding: 0 6px;
        width: 28px;
        height: 16px;
      }
    }

    &[data-display-type='indicator'] {
      .add-button {
        display: none;
      }
    }
  }

  &.readonly .handle {
    display: none;
  }
}
```