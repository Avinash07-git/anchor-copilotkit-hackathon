import { Spectrum } from 'spectrum-ts';
import { terminal } from 'spectrum-ts/providers/terminal';

const backendUrl = process.env.ANCHOR_BACKEND_URL ?? 'http://127.0.0.1:8000';
const observer = process.env.ANCHOR_SPECTRUM_OBSERVER ?? 'sarah';

/**
 * Photon Spectrum terminal bridge.
 *
 * Why this exists:
 * - The React app already talks to FastAPI over `/api/chat`.
 * - Photon Spectrum is a TypeScript messaging runtime, so the clean first
 *   integration point is a Node-side bridge that forwards Spectrum messages
 *   into the same backend endpoint instead of duplicating business logic.
 * - The terminal provider is credential-free, which makes it the safest way
 *   to verify the SDK locally before wiring real transport providers.
 */
async function main() {
  const app = await Spectrum({
    providers: [terminal.config()],
  });

  console.log(`[spectrum] Connected. Forwarding messages to ${backendUrl}/api/chat as observer=${observer}.`);

  for await (const [space, message] of app.messages) {
    if (message.type !== 'text') {
      await space.responding(async () => {
        await message.reply('Anchor can only process text messages right now.');
      });
      continue;
    }

    const text = message.text.trim();
    if (!text) {
      await space.responding(async () => {
        await message.reply('Send a text observation about Tom, Helen, or Sarah to update Anchor.');
      });
      continue;
    }

    try {
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          observer,
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend returned HTTP ${response.status}`);
      }

      const body = await response.json();
      const reply = typeof body.reply === 'string' && body.reply.trim()
        ? body.reply.trim()
        : 'Anchor received the observation, but did not return a reply.';

      await space.responding(async () => {
        await message.reply(reply);
      });
    } catch (error) {
      const description = error instanceof Error ? error.message : String(error);
      await space.responding(async () => {
        await message.reply(`Anchor could not process that message right now: ${description}`);
      });
    }
  }
}

main().catch((error) => {
  console.error('[spectrum] Fatal startup error:', error);
  process.exitCode = 1;
});
