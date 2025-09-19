import { underline } from './underline';
import { Editor } from '@milkdown/kit/core';

export function installMarks(editor: Editor) {
  editor.use(underline);
}
