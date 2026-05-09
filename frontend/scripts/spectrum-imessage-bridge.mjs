import http from 'node:http';

import { Spectrum } from 'spectrum-ts';
import { imessage } from 'spectrum-ts/providers/imessage';

const port = Number(process.env.SPECTRUM_PORT ?? '8787');
const allowedOrigin = process.env.SPECTRUM_ALLOWED_ORIGIN ?? 'http://127.0.0.1:5173';
const projectId = process.env.SPECTRUM_PROJECT_ID ?? '';
const projectSecret = process.env.SPECTRUM_PROJECT_SECRET ?? '';
const senderPhone = process.env.SPECTRUM_IMESSAGE_PHONE ?? '';

/**
 * iMessage recipient aliases live in server-side env vars so the browser never
 * sees raw addresses. Example:
 *   SPECTRUM_RECIPIENT_MARK_BROTHER=+14155551212
 */
function recipientEnvKey(alias) {
  return `SPECTRUM_RECIPIENT_${alias.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}`;
}

function json(res, status, body) {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
  });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

let spectrumAppPromise = null;

async function getSpectrumApp() {
  if (!projectId || !projectSecret) {
    throw new Error(
      'Missing Spectrum credentials. Set SPECTRUM_PROJECT_ID and SPECTRUM_PROJECT_SECRET.',
    );
  }

  if (!spectrumAppPromise) {
    spectrumAppPromise = Spectrum({
      projectId,
      projectSecret,
      providers: [imessage.config()],
    });
  }

  return spectrumAppPromise;
}

async function sendIMessage({ recipientAlias, text }) {
  if (typeof recipientAlias !== 'string' || recipientAlias.trim() === '') {
    throw new Error('recipientAlias is required.');
  }
  if (typeof text !== 'string' || text.trim() === '') {
    throw new Error('text is required.');
  }

  const recipientAddress = process.env[recipientEnvKey(recipientAlias)];
  if (!recipientAddress) {
    throw new Error(
      `No iMessage address configured for alias "${recipientAlias}". Set ${recipientEnvKey(recipientAlias)}.`,
    );
  }

  const app = await getSpectrumApp();
  const iMessage = imessage(app);

  // For direct messages, Spectrum resolves the iMessage chat from the recipient
  // address. If you run dedicated senders, `SPECTRUM_IMESSAGE_PHONE` pins which
  // phone to send from; otherwise the provider can choose.
  const space = senderPhone
    ? await iMessage.space([recipientAddress], { phone: senderPhone })
    : await iMessage.space([recipientAddress]);

  await space.responding(async () => {
    await space.send(text.trim());
  });

  return {
    ok: true,
    recipientAlias,
    recipientAddress,
    spaceId: space.id,
  };
}

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    json(res, 404, { ok: false, error: 'Not found.' });
    return;
  }

  if (req.method === 'OPTIONS') {
    json(res, 200, { ok: true });
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    json(res, 200, {
      ok: true,
      service: 'anchor-spectrum-imessage-bridge',
      configured: Boolean(projectId && projectSecret),
      allowedOrigin,
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/send-imessage') {
    try {
      const body = await readJson(req);
      const result = await sendIMessage(body);
      json(res, 200, result);
    } catch (error) {
      json(res, 400, {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return;
  }

  json(res, 404, { ok: false, error: 'Not found.' });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`[spectrum-imessage] Listening on http://127.0.0.1:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    try {
      if (spectrumAppPromise) {
        const app = await spectrumAppPromise;
        await app.stop();
      }
    } catch {
      // Best-effort shutdown only.
    } finally {
      server.close(() => process.exit(0));
    }
  });
}
