## 构建
`vite config`是动态，会根据`process.env.BUILD_MODE`的值来决定是库构建还是应用构建。
这取决于你执行的是`npm run build`还是`npm run build:lib`，前者会产出 dist 部署到服务器上的页面、后者会产出dist-lib用于发布到npm上。

构建库并发布到npm的时候，`pacakge.json`中的以下配置将会起作用
```js
{
  "main": "dist-lib/main.js",
  "types": "dist-lib/main.d.ts",
  "files": [
    "dist-lib"
  ],
}
```


## 启动
直接运行 `npm run dev`即是启动，src中的代码仅用于演示，也是正常vite项目初始化内容，   
而lib中的代码则是库的核心代码！   

`src`页面中中直接引入的`lib/mian`（而非 `dist-lib`），便于调试！

