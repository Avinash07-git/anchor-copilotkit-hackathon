import React from 'react';
import ReactDOM from 'react-dom/client';
import { CopilotKit } from '@copilotkit/react-core';
import App from './App';
import './styles/index.css';
import '@copilotkit/react-ui/styles.css';

/**
 * Bedside frontend entry.
 *
 * The <CopilotKit> provider wires the React tree into the CopilotKit
 * ecosystem (hooks like useCopilotAction / useCoAgent). We point it at our
 * own /api/copilotkit stub so the provider initialises cleanly. The
 * day-to-day chat traffic flows through /api/chat (FastAPI) and live
 * dashboard updates stream over /agui/stream (SSE) — keeping the
 * CopilotKit Node-side runtime out of the demo-day critical path.
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CopilotKit runtimeUrl="/api/copilotkit" agent="bedside_agent">
      <App />
    </CopilotKit>
  </React.StrictMode>,
);
