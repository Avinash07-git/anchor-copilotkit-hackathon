import React from 'react';
import ReactDOM from 'react-dom/client';
import { CopilotKit } from '@copilotkit/react-core';
import App from './App';
import './styles/index.css';

/**
 * Anchor frontend entry.
 *
 * Default demo path stays FastAPI-first for stage reliability. For sponsor
 * inspection, append ?copilot=1 to wrap the app in the real CopilotKit
 * provider pointed at /api/copilotkit. The provider path is intentionally
 * opt-in so the main judged demo cannot be destabilized by a runtime probe.
 */
const enableCopilotKitProof =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('copilot') === '1';

const app = enableCopilotKitProof ? (
  <CopilotKit runtimeUrl="/api/copilotkit">
    <App />
  </CopilotKit>
) : (
  <App />
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>{app}</React.StrictMode>,
);
