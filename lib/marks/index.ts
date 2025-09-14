import { Editor } from '@milkdown/kit/core';
import { underline } from './underline';


export function installMarks(editor: Editor) {
    editor.use(underline);
}

