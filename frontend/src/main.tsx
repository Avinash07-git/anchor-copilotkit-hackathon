import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

/**
 * Anchor frontend entry.
 *
 * Anchor uses CopilotKit's React UI conventions (chat surface, inline
 * approval pattern from `renderAndWait`) bridged directly to FastAPI via
 * /api/chat and /api/approval. We deliberately do NOT mount the
 * <CopilotKit> provider because it expects a GraphQL runtime that we
 * intentionally do not run on demo day (the FastAPI backend is the single
 * source of truth). Per CopilotKit's own docs, Pydantic AI is a first-
 * party supported backend; the bridge here is the conventional wiring.
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
