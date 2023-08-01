import { onMount } from 'solid-js';
import './App.css';

// eslint-disable-next-line import/no-relative-packages
import { attach } from '../../src/main';

function App() {
  let textareaRef: HTMLTextAreaElement;

  onMount(() => {
    attach(textareaRef, {
      uploadUrl: 'https://cors5566.deno.dev?url=https://freeimage.host/api/1/upload?key=6d207e02198a847aa98d0a2a901485a5',
      uploadFieldName: 'source',
      responseUrlKey: 'image.display_url',
    });
  });

  return (
    <>
      <h1>Hello</h1>

      <textarea ref={textareaRef!} cols="30" rows="10"></textarea>
    </>
  );
}

export default App;
