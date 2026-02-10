// 1. 引入插件和引擎
import { highlight, highlightPluginConfig } from '@milkdown/plugin-highlight';
import { createParser } from '@milkdown/plugin-highlight/lowlight';
import { common, createLowlight } from 'lowlight';

// 2. 引入样式（注意：因为你用了prose，这行引入可能被覆盖，但为了hljs类名必须有它）
import 'highlight.js/styles/github.css'; 

// 3. 准备解析器
const lowlight = createLowlight(common);
// 注册 mermaid 为空语言，避免 "Unknown language" 报错（实际渲染由 mermaid 插件的 NodeView 接管）
lowlight.register('mermaid', () => ({ name: 'mermaid', contains: [] }));
const parser = createParser(lowlight);

export {highlightPluginConfig, highlight, parser}

