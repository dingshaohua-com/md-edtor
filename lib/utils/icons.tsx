import { RiH1, RiH2, RiH3, RiTableLine, RiChatQuoteLine, RiSeparator, RiListUnordered, RiListOrdered, RiTodoLine, RiImageLine, RiFunctions, RiAddLine, RiCodeLine, RiText } from '@remixicon/react';
import type { Icon } from '../types';



export const icons: Record<string, Icon> = {
    h1: {
        key: 'h1',
        label: '标题1',
        icon: RiH1
    },
    h2: {
        key: 'h2',
        label: '标题2',
        icon: RiH2
    },
    h3: {
        key: 'h3',
        label: '标题3',
        icon: RiH3
    },
    text: {
        key: 'text',
        label: '正文',
        icon: RiText
    },
    table: {
        key: 'table',
        label: '表格',
        icon: RiTableLine
    },
    blockquote: {
        key: 'blockquote',
        label: '引用',
        icon: RiChatQuoteLine
    },
    hr: {
        key: 'hr',
        label: '分割线',
        icon: RiSeparator
    },
    bulletList: {
        key: 'bulletList',
        label: '无序列表',
        icon: RiListUnordered
    },
    orderedList: {
        key: 'orderedList',
        label: '有序列表',
        icon: RiListOrdered
    },
    taskList: {
        key: 'taskList',
        label: '任务列表',
        icon: RiTodoLine
    },
    image: {
        key: 'image',
        label: '图片',
        icon: RiImageLine
    },
    code: {
        key: 'code',
        label: '代码块',
        icon: RiCodeLine
    },
    add: {
        key: 'add',
        label: '添加',
        icon: RiAddLine
    }
}