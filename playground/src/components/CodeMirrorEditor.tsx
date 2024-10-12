import { createSignal, onMount } from 'solid-js';
import {
  drawSelection, EditorView, highlightSpecialChars, keymap, dropCursor,
  type ViewUpdate,
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language';

// eslint-disable-next-line import/no-relative-packages
import { inlineAttachmentExtension } from '../../../src';
import MarkdownPreview from './MarkdownPreview';
import { DEFAULT_MARKDOWN, OPTIONS } from '../constants';

const theme = EditorView.theme({
  '&': {
    color: 'white',
    backgroundColor: '#3B3B3B',
  },
  '&.cm-focused .cm-cursor': {
    borderLeftColor: 'white',
  },
}, { dark: true });

export const minimalSetup = (() => [
  highlightSpecialChars(),
  history(),
  drawSelection(),
  dropCursor(),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  keymap.of([
    ...defaultKeymap,
    ...historyKeymap,
  ]),
  theme,
])();

export function CodeMirrorEditor() {
  const [markdownValue, setMarkdownValue] = createSignal(DEFAULT_MARKDOWN);

  let editorRef: HTMLDivElement | null = null;
  onMount(() => {
    new EditorView({
      doc: markdownValue(),
      extensions: [
        minimalSetup,
        inlineAttachmentExtension(OPTIONS),
        EditorView.updateListener.of((v: ViewUpdate) => {
          if (v.docChanged) {
            setMarkdownValue(v.state.doc.toString());
          }
        }),
      ],
      parent: editorRef!,
    });
  });

  return (
    <section>
      <h2>CodeMirror v6</h2>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <div
          style={{ width: '50%' }}
          ref={(ref) => { editorRef = ref; }}></div>

        <MarkdownPreview
          style={{ width: '50%' }}
          markdown={markdownValue()}
        />
      </div>
    </section>
  );
}

export default CodeMirrorEditor;
