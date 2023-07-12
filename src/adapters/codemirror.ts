// eslint-disable-next-line import/no-extraneous-dependencies
import { EditorView } from '@codemirror/view';
import type { Extension } from '@codemirror/state';

import { Editor, InlineAttachmentOptions } from '../types';
import { InlineAttachment } from '../inline-attachment';

class CodeMirrorEditor implements Editor {
  view: EditorView;

  constructor(view: EditorView) {
    this.view = view;
  }

  getValue(): string {
    return this.view.state.doc.toString();
  }

  insertValue(value: string): void {
    this.view.dispatch(this.view.state.replaceSelection(value));
  }

  setValue(value: string): void {
    const cursor = this.view.state.selection.main.head;
    this.view.dispatch({
      changes: {
        from: 0,
        to: this.view.state.doc.length,
        insert: value,
      },
    });
    this.view.dispatch({ selection: { anchor: cursor } });
  }
}

// eslint-disable-next-line import/prefer-default-export
export class CodeMirrorInlineAttachmentAdapter {
  view: EditorView;

  inlineAttachment: InlineAttachment;

  constructor(view: EditorView, options: Partial<InlineAttachmentOptions>) {
    this.view = view;
    this.inlineAttachment = new InlineAttachment(new CodeMirrorEditor(view), options);
  }

  bind() {
    this.view.dom.addEventListener(
      'paste',
      (event) => {
        this.inlineAttachment.onPaste(event);
      },
      false,
    );

    this.view.dom.addEventListener(
      'drop',
      (event) => {
        event.stopPropagation();
        event.preventDefault();
        this.inlineAttachment.onDrop(event);
      },
      false,
    );

    this.view.dom.addEventListener(
      'dragenter',
      (event) => {
        event.stopPropagation();
        event.preventDefault();
      },
    );

    this.view.dom.addEventListener(
      'dragover',
      (event) => {
        event.stopPropagation();
        event.preventDefault();
      },
    );
  }
}

export function bindCodeMirror(...params: [EditorView, Partial<InlineAttachmentOptions>]) {
  return new CodeMirrorInlineAttachmentAdapter(...params).bind();
}

export function inlineAttachmentExtension(options: Partial<InlineAttachmentOptions>): Extension {
  return EditorView.domEventHandlers({
    paste: (event, view) => {
      const adapter = new CodeMirrorInlineAttachmentAdapter(view, options);
      adapter.inlineAttachment.onPaste(event);
    },
    drop: (event, view) => {
      event.stopPropagation();
      event.preventDefault();
      const adapter = new CodeMirrorInlineAttachmentAdapter(view, options);
      adapter.inlineAttachment.onDrop(event);
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
