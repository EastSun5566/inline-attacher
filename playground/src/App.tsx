import { onMount } from 'solid-js';
import { EditorView } from '@codemirror/view';

import './App.css';
import {
  type InlineAttachmentOptions,
  attach,
  inlineAttachmentExtension,
  // eslint-disable-next-line import/no-relative-packages
} from '../../dist/inline-attachment-next';

// TODO: fix typing
const options: Partial<InlineAttachmentOptions> = {
  uploadUrl: 'https://cors5566.deno.dev?url=https://freeimage.host/api/1/upload?key=6d207e02198a847aa98d0a2a901485a5',
  uploadFieldName: 'source',
  responseUrlKey: 'image.display_url',
};

function App() {
  let textareaRef: HTMLTextAreaElement;
  let editorRef: HTMLDivElement;

  onMount(() => {
    attach(textareaRef, options);

    // eslint-disable-next-line no-new
    new EditorView({
      doc: 'Paste/Drop image here\n\n',
      extensions: [
        inlineAttachmentExtension(options),
      ],
      parent: editorRef,
    });
  });

  return (
    <>
      <h1>📎 Inline Attachment</h1>

      <section>
        <h2>Textarea</h2>
        <textarea
          ref={textareaRef!}
          style={{ resize: 'none' }}
          cols="30"
          rows="5"
        >
          Paste/Drop image here\n\n
        </textarea>
      </section>

      <section>
        <h2>CodeMirror v6</h2>
        <div ref={editorRef!}></div>
      </section>
    </>
  );
}

export default App;
