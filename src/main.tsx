import { render } from 'preact';
import { registerSW } from 'virtual:pwa-register';
import { App } from './app';
import './styles.css';

registerSW();

// Ask the browser not to evict our storage; a no-op where unsupported (§5.3).
if ('storage' in navigator && 'persist' in navigator.storage) {
  void navigator.storage.persist().catch(() => undefined);
}

const root = document.getElementById('app');
if (root !== null) {
  render(<App />, root);
}
