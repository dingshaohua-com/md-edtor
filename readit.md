## 操作柄block-view
操作柄需要设置为absolute，而对应的编辑器外层需要设置为relative 且设置左右边距为操作柄腾出一点空间显示。因为操作柄需要跟随内容滚动！

但是操作柄相关菜单，我使用的是自己的useFloating，且需要设置为fixed。因为菜单不能被超出隐藏！


## 顶部浮动菜单tooltip-selection
其实顶部浮动菜单也需要，编辑器外层需要设置为relative！

操作柄的现实逻辑默认的有点问题：我点击操作柄的时候，不应该再为整个块显示出顶部浮动菜单。 也就是说两者互斥！
没办法我找到了crepe作者的方案，核心为自定义了顶部菜单的shouldShow逻辑，给搬了过来！


## plugin之间的相互通信
milkdown内部的数据共享不应该用react的，而是自己的一个切片工具！

## 样式
默认milkdown再解析md显示的时候，是没有样式，它仅仅解析为html结构。
样式由你自己定义，这和markdown-it等插件表现一致！

我懒得自定义，所以使用了 [github-markdown-css](https://github.com/sindresorhus/github-markdown-css)！


## 插入表格
插入表格推荐使用milkdown内置的插入命令 `editor.action(callCommand(insertTableCommand.key))`,   
不过表格本身不被md规范支持，需要给milkdown提供gfm扩展插件的支持，这个前边已经说过了不再重复！   

然后gfm仅仅是让你的md能够识别表格的md语法，但是像 右键插入表格单元等操作还需要使用milkdown自己提供的表格扩展插件 
```jsx
import { tableBlock } from "@milkdown/kit/component/table-block";
const { get, loading } = useEditor((root) => {
    const editor = Editor.make()
        .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, mdContent);
        })
        .use(commonmark)
        .use(gfm)
        .use(tableBlock); // 这个
})
```

这样还是不行，因为milkdown自己提供的表格扩展插件 并没有提供样式，好在crepe已经提供了，样式都放在了`packages\crepe\src\theme\common\table.css`，我于是复制了一份
```css
 @import './table-block.css';
```