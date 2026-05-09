/**
 * NotionPanel — displays the Anchor Care Log synced to Notion,
 * rendered via the A2UI DataTable component.
 */
import { useEffect, useState } from 'react';
import A2UIRenderer, { type A2UISpec } from './A2UIRenderer';

interface NotionEntry {
  id: string;
  url: string;
  title: string;
  patient: string;
  observer: string;
  observation: string;
  wellbeing_score: number | null;
  alert_level: string;
  date: string;
}

interface Props {
  className?: string;
}

export default function NotionPanel({ className = '' }: Props) {
  const [entries, setEntries] = useState<NotionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchLogs = async () => {
    try {
      const r = await fetch('/api/notion/logs?limit=15', { credentials: 'include' });
      if (!r.ok) {
        setError('Notion sync not configured yet');
        return;
      }
      const data = await r.json();
      setEntries(data.entries ?? []);
      setLastFetched(new Date());
      setError(null);
    } catch {
      setError('Could not reach backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const id = setInterval(fetchLogs, 30_000);
    return () => clearInterval(id);
  }, []);

  // Build an A2UI spec from the entries
  const a2uiSpec: A2UISpec = {
    v: '0.8',
    root: 'care_log',
    nodes: {
      care_log: {
        type: 'DataTable',
        props: {
          title: 'Anchor Care Log · Notion',
          columns: [
            { key: 'date',            label: 'Date' },
            { key: 'patient',         label: 'Patient' },
            { key: 'wellbeing_score', label: 'Score' },
            { key: 'alert_level',     label: 'Status' },
            { key: 'observation',     label: 'Observation' },
          ],
          rows: entries.map((e) => ({
            date:            e.date || '—',
            patient:         e.patient || '—',
            wellbeing_score: e.wellbeing_score,
            alert_level:     e.alert_level || 'green',
            observation:     (e.observation || '').slice(0, 80) + (e.observation?.length > 80 ? '…' : ''),
          })),
        },
      },
    },
  };

  return (
    <section className={`rounded-[24px] border border-[rgba(176,111,170,0.18)] bg-[rgba(255,255,255,0.75)] p-5 shadow-soft backdrop-blur ${className}`}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-black text-white text-base">
            N
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(176,111,170,0.60)]">
              Notion MCP · A2UI
            </p>
            <p className="font-display text-sm font-semibold leading-none text-[#7C4C78]">
              Care Log Database
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lastFetched && (
            <span className="text-[10px] text-[rgba(176,111,170,0.50)]">
              {lastFetched.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={fetchLogs}
            className="rounded-full border border-[rgba(176,111,170,0.18)] px-3 py-1 text-[11px] font-semibold text-[#B06FAA] transition hover:bg-[#B06FAA] hover:text-white"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Body */}
      {loading && (
        <div className="flex h-20 items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[rgba(176,111,170,0.20)] border-t-[#B06FAA]" />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-[14px] border border-[rgba(176,111,170,0.18)] bg-[#FAF0F8] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(176,111,170,0.55)]">
            Setup required
          </p>
          <p className="mt-1 text-sm text-[rgba(176,111,170,0.75)]">{error}</p>
          <p className="mt-2 text-[11px] text-[rgba(176,111,170,0.50)]">
            Share a Notion page with the integration and set{' '}
            <code className="rounded bg-[rgba(176,111,170,0.10)] px-1">NOTION_PARENT_PAGE_ID</code>{' '}
            in backend/.env
          </p>
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="rounded-[14px] border border-[rgba(176,111,170,0.14)] bg-[#FAF0F8] px-4 py-4 text-center">
          <p className="text-sm text-[rgba(176,111,170,0.60)]">
            No entries yet — log an observation to sync it to Notion.
          </p>
        </div>
      )}

      {!loading && !error && entries.length > 0 && (
        <A2UIRenderer spec={a2uiSpec} />
      )}
    </section>
  );
}
