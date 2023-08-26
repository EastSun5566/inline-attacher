import { onMount } from 'solid-js';
import { EditorView } from '@codemirror/view';

import './App.css';
import { Textarea } from './components/Textarea';

// eslint-disable-next-line import/no-relative-packages
import { inlineAttachmentExtension } from '../../dist/inline-attacher';
import { OPTIONS } from './constants';

export function App() {
  let editorRef: HTMLDivElement;

  onMount(() => {
    new EditorView({
      doc: 'Paste/Drop image here\n\n',
      extensions: [
        inlineAttachmentExtension(OPTIONS),
      ],
      parent: editorRef,
    });
  });

  return (
    <>
      <h1>📎 Inline Attachment</h1>

      <Textarea />

      <section>
        <h2>CodeMirror v6</h2>
        <div ref={editorRef!}></div>
      </section>
    </>
  );
}

export default App;
