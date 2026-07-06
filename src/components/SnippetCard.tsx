import type { JSX } from 'preact';
import type { Snippet } from '../lib/texts';

interface Props {
  snippet: Snippet;
}

export function SnippetCard({ snippet }: Props): JSX.Element {
  return (
    <figure class="snippet">
      <blockquote>{snippet.text}</blockquote>
      <figcaption>— {snippet.source}</figcaption>
    </figure>
  );
}
