const DEFAULT_BRIDGE_URL = 'http://127.0.0.1:8787';

export interface SendIMessageDraftInput {
  recipientAlias: string;
  text: string;
}

export interface SendIMessageDraftResult {
  ok: boolean;
  recipientAlias: string;
  recipientAddress: string;
  spaceId: string;
}

export const spectrumBridgeBaseUrl =
  import.meta.env.VITE_SPECTRUM_BRIDGE_URL ?? DEFAULT_BRIDGE_URL;

/**
 * Browser helper for the local Spectrum iMessage bridge.
 *
 * Why this is helpful:
 * - the React app can trigger sends from the UI;
 * - the actual Spectrum credentials stay in the Node bridge process;
 * - the backend's approval flow remains the source of truth for caregiver
 *   consent while delivery happens through the documented SDK.
 */
export async function sendIMessageDraft(
  input: SendIMessageDraftInput,
): Promise<SendIMessageDraftResult> {
  const res = await fetch(`${spectrumBridgeBaseUrl}/send-imessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const body = (await res.json()) as SendIMessageDraftResult | { error?: string };
  if (!res.ok) {
    throw new Error(body && 'error' in body && body.error ? body.error : `HTTP ${res.status}`);
  }

  return body as SendIMessageDraftResult;
}
