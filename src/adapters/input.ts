import { InlineAttachment } from '../core';
import type { Editor, InlineAttachmentOptions } from '../types';

type InputElement = HTMLInputElement | HTMLTextAreaElement;

/**
 * Inserts the given value at the current cursor position of the textarea element
 */
function insertTextAtCursor(element: InputElement, text: string) {
  const scrollPos = element.scrollTop;
  let strPos = 0;
  let browser: string | false = false;
  let range;

  if ((element.selectionStart || element.selectionStart === 0)) {
    browser = 'ff';
  } else if ((document as any).selection) {
    browser = 'ie';
  }

  if (browser === 'ie') {
    element.focus();
    range = (document as any).selection.createRange();
    range.moveStart('character', -element.value.length);
    strPos = range.text.length;
  } else if (browser === 'ff') {
    strPos = element.selectionStart || 0;
  }

  const front = (element.value).substring(0, strPos);
  const back = (element.value).substring(strPos, element.value.length);
  element.value = front + text + back;
  strPos += text.length;
  if (browser === 'ie') {
    element.focus();
    range = (document as any).selection.createRange();
    range.moveStart('character', -element.value.length);
    range.moveStart('character', strPos);
    range.moveEnd('character', 0);
    range.select();
  } else if (browser === 'ff') {
    element.selectionStart = strPos;
    element.selectionEnd = strPos;
    element.focus();
  }
  element.scrollTop = scrollPos;
}

class InputEditor<TInstance extends InputElement> implements Editor<TInstance> {
  instance: TInstance;

  constructor(element: TInstance) {
    this.instance = element;
  }

  getValue() {
    return this.instance.value;
  }

  insertValue(value: string) {
    insertTextAtCursor(this.instance, value);
  }

  setValue(value: string) {
    this.instance.value = value;
  }
}

export class InputInlineAttachmentAdapter<
  TInstance extends InputElement,
> extends InlineAttachment<TInstance> {
  constructor(element: TInstance, options: Partial<InlineAttachmentOptions> = {}) {
    super(new InputEditor(element), options);
  }

  bind() {
    this.editor.instance.addEventListener(
      'paste',
      (event) => {
        this.onPaste(event as ClipboardEvent);
      },
      false,
    );

    this.editor.instance.addEventListener(
      'drop',
      (event) => {
        event.stopPropagation();
        event.preventDefault();
        this.onDrop(event as DragEvent);
      },
      false,
    );

    this.editor.instance.addEventListener(
      'dragenter',
      (event) => {
        event.stopPropagation();
        event.preventDefault();
      },
    );

    this.editor.instance.addEventListener(
      'dragover',
      (event) => {
        event.stopPropagation();
        event.preventDefault();
      },
    );
  }
}

export function attach(...params: [InputElement, Partial<InlineAttachmentOptions>?]) {
  return new InputInlineAttachmentAdapter(...params).bind();
}
