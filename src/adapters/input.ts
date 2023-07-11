import { InlineAttachment } from '../inline-attachment';
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

class InputEditor implements Editor {
  private element: InputElement;

  constructor(element: InputElement) {
    this.element = element;
  }

  getValue() {
    return this.element.value;
  }

  insertValue(value: string) {
    insertTextAtCursor(this.element, value);
  }

  setValue(value: string) {
    this.element.value = value;
  }
}

export class InlineAttachmentInputAdapter {
  element: InputElement;

  inlineAttachment: InlineAttachment;

  constructor(element: InputElement, options: Partial<InlineAttachmentOptions>) {
    this.element = element;
    this.inlineAttachment = new InlineAttachment(new InputEditor(element), options);
  }

  bind() {
    this.element.addEventListener(
      'paste',
      (event) => {
        this.inlineAttachment.onPaste(event as ClipboardEvent);
      },
      false,
    );

    this.element.addEventListener(
      'drop',
      (event) => {
        event.stopPropagation();
        event.preventDefault();
        this.inlineAttachment.onDrop(event as DragEvent);
      },
      false,
    );

    this.element.addEventListener(
      'dragenter',
      (event) => {
        event.stopPropagation();
        event.preventDefault();
      },
    );

    this.element.addEventListener(
      'dragover',
      (event) => {
        event.stopPropagation();
        event.preventDefault();
      },
    );
  }
}

export function bind2Input(...params: [InputElement, Partial<InlineAttachmentOptions>]) {
  return new InlineAttachmentInputAdapter(...params);
}
