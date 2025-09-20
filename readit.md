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