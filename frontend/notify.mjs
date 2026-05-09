/**
 * One-shot iMessage alert sender via Photon/spectrum-ts.
 * Usage: node notify.mjs <phone> <message>
 * Env:   PHOTON_PROJECT_ID, PHOTON_API_KEY
 */
import { createClient, directChat } from "@photon-ai/advanced-imessage";

const PROJECT_ID = process.env.PHOTON_PROJECT_ID;
const API_KEY    = process.env.PHOTON_API_KEY;
const TO_PHONE   = process.argv[2];
const MESSAGE    = process.argv[3];

if (!PROJECT_ID || !API_KEY) {
  console.error("Missing PHOTON_PROJECT_ID or PHOTON_API_KEY");
  process.exit(1);
}
if (!TO_PHONE || !MESSAGE) {
  console.error("Usage: node notify.mjs <phone> <message>");
  process.exit(1);
}

async function issueToken() {
  const auth = Buffer.from(`${PROJECT_ID}:${API_KEY}`).toString("base64");
  const res = await fetch(
    `https://spectrum.photon.codes/projects/${PROJECT_ID}/imessage/tokens`,
    { method: "POST", headers: { Authorization: `Basic ${auth}` } }
  );
  if (!res.ok) throw new Error(`Token request failed: ${res.status} ${await res.text()}`);
  const body = await res.json();
  return body.data.token;
}

const token   = await issueToken();
const address = process.env.SPECTRUM_IMESSAGE_ADDRESS ?? "imessage.spectrum.photon.codes:443";

const im = createClient({ address, token });

await im.messages.send(directChat(TO_PHONE), MESSAGE);
await im.close();
process.exit(0);
