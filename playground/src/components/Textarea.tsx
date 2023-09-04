import { createSignal, onMount } from 'solid-js';

import { MarkdownPreview } from './MarkdownPreview';
// eslint-disable-next-line import/no-relative-packages
import { attach } from '../../../src';
import { OPTIONS } from '../constants';

export function Textarea() {
  const [markdownValue, setMarkdownValue] = createSignal('Paste/Drop image here\n');

  let textareaRef: HTMLTextAreaElement;
  onMount(() => {
    attach(textareaRef, OPTIONS);
  });

  return (
    <>
      <section>
        <h2>Textarea</h2>

        <div style={{ display: 'flex' }}>
          <textarea
            ref={textareaRef!}
            value={markdownValue()}
            onInput={({ target }) => setMarkdownValue(target.value)}
            style={{ resize: 'none', 'margin-right': '1rem' }}
            cols="30"
            rows="5"
          />

          <MarkdownPreview markdown={markdownValue()} />
        </div>
      </section>

    </>
  );
}

export default Textarea;
