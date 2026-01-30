import neotoc from '@repo/neotoc';
import { debounce, throttle } from 'lodash-es';
import '@repo/neotoc/base-modern.css';
import '@repo/neotoc/colors-zinc.css';



/**
 * 类型定义
 */
interface NeoTocOptions {
  io: string;
  to: HTMLElement;
  title?: string;
  initialFoldLevel?: number;
  offsetTop?: number;
  ellipsis?: boolean;
}

let currentTocNode: HTMLElement | null = null;
let currentCleanup: (() => void) | null = null; // 保存 neotoc 返回的 cleanup 函数
let lastHash: string = '';

// 提取统一配置，方便维护
const DEFAULT_CONFIG = {
  io: '.milkdown .editor >> h2,h3,h4',
  title: '目录',
  initialFoldLevel: 3,
  offsetTop: 80,
  ellipsis: true,
};

/**
 * 扫描当前编辑器内的标题，生成唯一标识 hash
 * 用于判断是否真的需要重绘 DOM
 */
const getHeadingsHash = (): string => {
  const headings = document.querySelectorAll('.milkdown .editor h2, .milkdown .editor h3, .milkdown .editor h4');
  // 拼接 标签名+内容，确保层级改变也能检测到
  return Array.from(headings)
    .map((h) => `${h.tagName}-${h.textContent}`)
    .join('|');
};

/**
 * 初始化函数
 */
export const init = (node: HTMLElement) => {
  if (!node) return;

  currentTocNode = node;
  lastHash = getHeadingsHash(); // 记录初始状态

  // 保存 cleanup 函数
  currentCleanup = neotoc({
    ...DEFAULT_CONFIG,
    to: node,
  } as NeoTocOptions);
};

/**
 * 实际执行更新的函数
 */
const performUpdate = () => {
  if (!currentTocNode) return;

  const newHash = getHeadingsHash();

  // 性能优化：如果标题内容/结构没变，直接拦截，不操作 DOM
  if (newHash === lastHash) {
    return;
  }

  // 先清理旧实例（停止 requestAnimationFrame）
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  // 执行重绘
  currentTocNode.innerHTML = '';
  currentCleanup = neotoc({
    ...DEFAULT_CONFIG,
    to: currentTocNode,
  } as NeoTocOptions);

  lastHash = newHash;
  console.log('[NeoToc] Table of contents updated.');
};

/**
 * 核心更新逻辑：节流 + 防抖组合
 * - 节流：保证至少每 300ms 检查一次
 * - 防抖：用户停止输入 150ms 后立即更新
 */
const throttledUpdate = throttle(performUpdate, 300, {
  leading: false,  // 第一次调用不立即执行
  trailing: true,  // 确保最后一次调用会执行
});

export const update = debounce(() => {
  throttledUpdate();
  throttledUpdate.flush(); // 如果防抖触发，立即执行节流中的任务
}, 150);

/**
 * 销毁函数
 * 在 React 组件卸载时调用，防止内存泄漏
 */
export const destroy = () => {
  // 先清理 neotoc 实例
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  if (currentTocNode) {
    currentTocNode.innerHTML = '';
  }

  // 取消所有待执行的任务
  update.cancel();
  throttledUpdate.cancel();

  currentTocNode = null;
  lastHash = '';
};

export default {
  init,
  update,
  destroy,
};