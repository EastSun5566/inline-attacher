import { createEffect, type JSX } from 'solid-js';
import parse from 'snarkdown';
import { innerHTML } from 'diffhtml';

interface MarkdownPreviewProps {
  style: string | JSX.CSSProperties | undefined;
  markdown: string;
}

export function MarkdownPreview(props: MarkdownPreviewProps) {
  let previewRef: HTMLDivElement | null = null;
  createEffect(() => {
    const html = parse(props.markdown);
    innerHTML(previewRef!, html);
  });

  return (
  <div
    style={props.style}
    ref={(ref) => { previewRef = ref; }} />
  );
}

export default MarkdownPreview;
