/* eslint-disable no-param-reassign */
import { InlineAttachment } from '../core';
import type { Editor, InlineAttachmentOptions } from '../types';

type InputElement = HTMLInputElement | HTMLTextAreaElement;

/** Inserts the given value at the current cursor position of the textarea element */
function insertTextAtCursor(element: InputElement, text: string) {
  const scrollPos = element.scrollTop;
  const strPos = element.selectionStart || 0;

  const { value } = element;
  const front = value.slice(0, strPos);
  const back = value.slice(strPos, value.length);
  element.value = front + text + back;

  const newPos = strPos + text.length;
  element.selectionStart = newPos;
  element.selectionEnd = newPos;

  element.scrollTop = scrollPos;
  element.focus();
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
    this.dispatchInputEvent();
  }

  setValue(value: string) {
    this.instance.value = value;
    this.dispatchInputEvent();
  }

  dispatchInputEvent() {
    this.instance.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      cancelable: true,
    }));
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
    );

    this.editor.instance.addEventListener(
      'drop',
      (event) => {
        event.preventDefault();

        this.onDrop(event as DragEvent);
      },
    );

    this.editor.instance.addEventListener(
      'dragover',
      (event) => {
        event.preventDefault();
      },
    );
  }
}

export function attach(...params: [InputElement, Partial<InlineAttachmentOptions>?]): void {
  return new InputInlineAttachmentAdapter(...params).bind();
}
