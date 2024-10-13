import { EditorView } from '@codemirror/view';
import type { Extension } from '@codemirror/state';

import { Editor, InlineAttachmentOptions } from '../types';
import { InlineAttachment } from '../core';

class CodeMirrorEditor<TInstance extends EditorView> implements Editor<TInstance> {
  instance: TInstance;

  constructor(editorView: TInstance) {
    this.instance = editorView;
  }

  getValue(): string {
    return this.instance.state.doc.toString();
  }

  insertValue(value: string): void {
    this.instance.dispatch(this.instance.state.replaceSelection(value));
  }

  setValue(value: string): void {
    const cursor = this.instance.state.selection.main.head;
    this.instance.dispatch({
      changes: {
        from: 0,
        to: this.instance.state.doc.length,
        insert: value,
      },
    });
    this.instance.dispatch({ selection: { anchor: cursor } });
  }
}

export class CodeMirrorInlineAttachmentAdapter<
  TInstance extends EditorView,
> extends InlineAttachment<TInstance> {
  constructor(editorView: TInstance, options: Partial<InlineAttachmentOptions> = {}) {
    super(new CodeMirrorEditor(editorView), options);
  }

  bind() {
    this.editor.instance.dom.addEventListener(
      'paste',
      (event) => {
        this.onPaste(event);
      },
    );

    this.editor.instance.dom.addEventListener(
      'drop',
      (event) => {
        event.stopPropagation();
        event.preventDefault();

        this.onDrop(event);
      },
    );

    this.editor.instance.dom.addEventListener(
      'dragenter',
      (event) => {
        event.stopPropagation();
        event.preventDefault();
      },
    );

    this.editor.instance.dom.addEventListener(
      'dragover',
      (event) => {
        event.stopPropagation();
        event.preventDefault();
      },
    );
  }
}

export function attachCodeMirror(...params: [EditorView, Partial<InlineAttachmentOptions>?]): void {
  return new CodeMirrorInlineAttachmentAdapter(...params).bind();
}

export function inlineAttachmentExtension(
  options: Partial<InlineAttachmentOptions> = {},
): Extension {
  return EditorView.domEventHandlers({
    paste: (event, view) => {
      const inlineAttachment = new CodeMirrorInlineAttachmentAdapter(view, options);
      inlineAttachment.onPaste(event);
    },
    drop: (event, view) => {
      event.stopPropagation();
      event.preventDefault();

      const inlineAttachment = new CodeMirrorInlineAttachmentAdapter(view, options);
      inlineAttachment.onDrop(event);
    },
    dragenter: (event) => {
      event.stopPropagation();
      event.preventDefault();
    },
    dragover: (event) => {
      event.stopPropagation();
      event.preventDefault();
    },
  });
}
