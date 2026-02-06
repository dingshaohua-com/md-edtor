import { linkSchema } from "@milkdown/kit/preset/commonmark";
import { getEditor } from "./helper";


export const linkRemove = () => {
    const { ctx, view, from, to, state } = getEditor();
    const linkType = linkSchema.type(ctx);
    // 查找包含当前选区的链接节点范围
    let linkStart = -1;
    let linkEnd = -1;
    let linkMark: ReturnType<typeof linkType.isInSet> = undefined;

    // 从光标位置向前后扩展，找到完整的链接范围
    state.doc.nodesBetween(from, from === to ? to + 1 : to, (node, pos) => {
        const mark = linkType.isInSet(node.marks);
        if (mark) {
            linkMark = mark;
            if (linkStart === -1) linkStart = pos;
            linkEnd = pos + node.nodeSize;
        }
    });

    if (linkMark && linkStart !== -1) {
        // 移除链接 mark
        const tr = state.tr.removeMark(linkStart, linkEnd, linkMark);
        view.dispatch(tr);
    }

    view.focus();
};