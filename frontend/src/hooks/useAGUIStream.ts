// useAGUIStream — subscribe to /agui/stream (Server-Sent Events).
//
// Why SSE not WebSocket: the backend emits **uni-directional** events to
// the client (agent_step + plan_updated). SSE is simpler, auto-reconnects,
// and works through every proxy. CopilotKit runs on a similar transport;
// when the official starter kit lands, this hook is the swap point.

import { useEffect, useRef, useState } from 'react';
import type { UIPlan } from '../types/uiPlan';

export interface AgentStep {
  id: number;
  text: string;
  ts: string;
}

export interface AGUIState {
  plan: UIPlan | null;
  steps: AgentStep[];
  connected: boolean;
}

export function useAGUIStream(): AGUIState {
  const [plan, setPlan] = useState<UIPlan | null>(null);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [connected, setConnected] = useState(false);
  const stepIdRef = useRef(0);

  useEffect(() => {
    const es = new EventSource('/agui/stream');
    es.addEventListener('open', () => setConnected(true));
    es.addEventListener('error', () => setConnected(false));

    es.addEventListener('plan_updated', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data) as UIPlan;
        setPlan(data);
        // Reset steps on each new plan so the panel reflects the latest run.
        setSteps([]);
        stepIdRef.current = 0;
      } catch (err) {
        console.error('[agui] bad plan_updated payload', err);
      }
    });

    es.addEventListener('agent_step', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data) as { text: string };
        const id = ++stepIdRef.current;
        setSteps((prev) => [...prev, { id, text: data.text, ts: new Date().toISOString() }]);
      } catch (err) {
        console.error('[agui] bad agent_step payload', err);
      }
    });

    return () => es.close();
  }, []);

  return { plan, steps, connected };
}
