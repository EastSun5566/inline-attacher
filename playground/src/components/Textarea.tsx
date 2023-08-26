import { createSignal, onMount } from 'solid-js';
// import { template } from 'solid-js/web';
// import snarkdown from 'snarkdown';

// eslint-disable-next-line import/no-relative-packages
import { attach } from '../../../dist/inline-attacher';
import { OPTIONS } from '../constants';

export function Textarea() {
  const [value, setValue] = createSignal('Paste/Drop image here\n\n');
  // const html = () => template(snarkdown(value()));

  let textareaRef: HTMLTextAreaElement;
  onMount(() => {
    attach(textareaRef, OPTIONS);
  });

  return (
    <>
      <section>
        <h2>Textarea</h2>
        <textarea
          ref={textareaRef!}
          value={value()}
          onInput={({ target }) => setValue(target.value)}
          style={{ resize: 'none' }}
          cols="30"
          rows="5"
        />
      </section>

      <section>
        {/* {html()} */}
      </section>
    </>
  );
}

export default Textarea;
