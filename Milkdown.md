## 安装必要依赖
milkdown核心包和react扩展包！
```sh
npm i @milkdown/react @milkdown/kit
``` 

## 自定义顶部浮动菜单
这里有[官方教程](https://milkdown.dev/docs/api/plugin-tooltip)，甚至还提供了vue、react等版本的[demo](https://milkdown.dev/docs/plugin/example-tooltip-plugin)！


## 注册GFM
像一些诸如 `删除线`等格式，是原生Markdown不支持的，需要安装GFM扩展包！    
好在milkdown已经内置了GFM扩展包，我们只需要引入即可！
```sh
import { gfm } from '@milkdown/kit/preset/gfm'

const editor = Editor
  .make()
  .use(gfm)
```

然后我们就可以使用这个包了，比如
```js
import { toggleStrikethroughCommand } from '@milkdown/kit/preset/gfm';

editor.action((ctx) => ctx.get(commandsCtx).call(toggleStrikethroughCommand.key))
```


## 自定义mark
除了标准的加粗、斜体，有些特殊的标记，甚至在[GFM扩展的MD语法](https://github.github.com/gfm)中都[不存在](https://github.com/Milkdown/milkdown/issues/914)。  
这个时候就需要我们自定义了！

我把自定义的标记都放在了 `marks`目录中了，比如下划线等等！
