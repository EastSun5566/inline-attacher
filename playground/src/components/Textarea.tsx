import { createSignal, onMount } from 'solid-js';

import { MarkdownPreview } from './MarkdownPreview';
// eslint-disable-next-line import/no-relative-packages
import { attach } from '../../../src';
import { DEFAULT_MARKDOWN, OPTIONS } from '../constants';

export function Textarea() {
  const [markdownValue, setMarkdownValue] = createSignal(DEFAULT_MARKDOWN);

  let textareaRef: HTMLTextAreaElement | null = null;
  onMount(() => {
    attach(textareaRef!, OPTIONS);
  });

  return (
    <>
      <section>
        <h2>Textarea</h2>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ width: '50%' }}>
            <textarea
              ref={(ref) => { textareaRef = ref; }}
              value={markdownValue()}
              onInput={({ target }) => setMarkdownValue(target.value)}
              style={{ resize: 'none', width: '100%' }}
              cols="30"
              rows="5"
            />
          </div>

          <MarkdownPreview
            style={{ width: '50%' }}
            markdown={markdownValue()}
          />
        </div>
      </section>

    </>
  );
}

export default Textarea;
