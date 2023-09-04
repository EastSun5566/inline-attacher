import { createEffect } from 'solid-js';
import parse from 'snarkdown';
import { innerHTML } from 'diffhtml';

interface MarkdownPreviewProps {
  markdown: string;
}

export function MarkdownPreview(props: MarkdownPreviewProps) {
  let previewRef: HTMLDivElement;
  createEffect(() => {
    const html = parse(props.markdown);
    innerHTML(previewRef, html);
  });

  return <div ref={previewRef!} />;
}

export default MarkdownPreview;
