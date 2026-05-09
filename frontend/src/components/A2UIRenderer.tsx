/**
 * A2UI v0.8 renderer — maps declarative agent JSON to native Anchor components.
 *
 * Protocol: { v, root, nodes: { [id]: { type, props, children? } } }
 * Supported types: DataTable, Card, StatRow, AlertBanner, Text, Badge
 */
import type { ReactNode } from 'react';

// ---------------------------------------------------------------------------
// A2UI node types
// ---------------------------------------------------------------------------

type A2UINode =
  | { type: 'DataTable';   props: DataTableProps;   children?: never }
  | { type: 'Card';        props: CardProps;         children?: string[] }
  | { type: 'StatRow';     props: StatRowProps;      children?: never }
  | { type: 'AlertBanner'; props: AlertBannerProps;  children?: never }
  | { type: 'Text';        props: TextProps;         children?: never }
  | { type: 'Badge';       props: BadgeProps;        children?: never };

interface DataTableProps {
  title?: string;
  columns: Array<{ key: string; label: string }>;
  rows: Record<string, unknown>[];
}
interface CardProps    { title?: string; subtitle?: string }
interface StatRowProps { label: string; value: string | number; unit?: string }
interface AlertBannerProps { level: 'green' | 'yellow' | 'amber' | 'red'; message: string }
interface TextProps    { content: string; muted?: boolean }
interface BadgeProps   { label: string; color?: string }

export interface A2UISpec {
  v: string;
  root: string;
  nodes: Record<string, A2UINode>;
}

// ---------------------------------------------------------------------------
// Colour helpers
// ---------------------------------------------------------------------------

const LEVEL_CLASSES: Record<string, string> = {
  green:  'border-[#16a34a] bg-[#ecfdf5] text-[#14532d]',
  yellow: 'border-[#ca8a04] bg-[#fefce8] text-[#713f12]',
  amber:  'border-[#d97706] bg-[#fff7ed] text-[#7c2d12]',
  red:    'border-[#dc2626] bg-[#fef2f2] text-[#7f1d1d]',
};

const BADGE_DOT: Record<string, string> = {
  green:  'bg-[#16a34a]',
  yellow: 'bg-[#ca8a04]',
  amber:  'bg-[#d97706]',
  red:    'bg-[#dc2626]',
  gray:   'bg-[#737373]',
};

// ---------------------------------------------------------------------------
// Node renderers
// ---------------------------------------------------------------------------

function renderNode(id: string, nodes: Record<string, A2UINode>): ReactNode {
  const node = nodes[id];
  if (!node) return null;

  switch (node.type) {
    case 'DataTable':  return <A2UiDataTable key={id} {...node.props} />;
    case 'Card':       return (
      <A2UiCard key={id} {...node.props}>
        {node.children?.map((cid) => renderNode(cid, nodes))}
      </A2UiCard>
    );
    case 'StatRow':    return <A2UiStatRow     key={id} {...node.props} />;
    case 'AlertBanner':return <A2UiAlertBanner key={id} {...node.props} />;
    case 'Text':       return <A2UiText        key={id} {...node.props} />;
    case 'Badge':      return <A2UiBadge       key={id} {...node.props} />;
    default:           return null;
  }
}

// ---------------------------------------------------------------------------
// Individual component renderers
// ---------------------------------------------------------------------------

function A2UiDataTable({ title, columns, rows }: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-[rgba(176,111,170,0.18)] bg-white">
      {title && (
        <div className="border-b border-[rgba(176,111,170,0.10)] px-5 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(176,111,170,0.60)]">
            A2UI · DataTable
          </p>
          <p className="mt-0.5 font-display text-sm font-semibold text-[#7C4C78]">{title}</p>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(176,111,170,0.10)] bg-[#FAF0F8]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(176,111,170,0.60)]"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-[rgba(176,111,170,0.06)] transition hover:bg-[#FAF0F8]"
              >
                {columns.map((col) => {
                  const val = row[col.key];
                  if (col.key === 'alert_level') {
                    const lvl = String(val || 'green');
                    return (
                      <td key={col.key} className="px-4 py-2">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full ${BADGE_DOT[lvl] ?? BADGE_DOT.gray}`} />
                          <span className="capitalize text-[#7C4C78]">{lvl}</span>
                        </span>
                      </td>
                    );
                  }
                  if (col.key === 'wellbeing_score') {
                    const score = Number(val ?? 0);
                    const color = score < 20 ? '#dc2626' : score < 50 ? '#d97706' : '#16a34a';
                    return (
                      <td key={col.key} className="px-4 py-2 font-semibold" style={{ color }}>
                        {score}/100
                      </td>
                    );
                  }
                  return (
                    <td key={col.key} className="px-4 py-2 text-[#7C4C78]">
                      {String(val ?? '—')}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function A2UiCard({ title, subtitle, children }: CardProps & { children?: ReactNode }) {
  return (
    <div className="rounded-[18px] border border-[rgba(176,111,170,0.18)] bg-white p-4 shadow-soft">
      {title && <p className="font-display text-sm font-semibold text-[#7C4C78]">{title}</p>}
      {subtitle && <p className="mt-0.5 text-xs text-[rgba(176,111,170,0.65)]">{subtitle}</p>}
      {children && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
}

function A2UiStatRow({ label, value, unit }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-[rgba(176,111,170,0.65)]">{label}</span>
      <span className="text-sm font-semibold text-[#7C4C78]">
        {value}{unit && <span className="ml-0.5 text-xs font-normal">{unit}</span>}
      </span>
    </div>
  );
}

function A2UiAlertBanner({ level, message }: AlertBannerProps) {
  return (
    <div className={`rounded-[14px] border px-4 py-3 text-sm font-medium ${LEVEL_CLASSES[level] ?? LEVEL_CLASSES.green}`}>
      {message}
    </div>
  );
}

function A2UiText({ content, muted }: TextProps) {
  return (
    <p className={`text-sm leading-6 ${muted ? 'text-[rgba(176,111,170,0.60)]' : 'text-[#7C4C78]'}`}>
      {content}
    </p>
  );
}

function A2UiBadge({ label, color = 'green' }: BadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(176,111,170,0.18)] bg-[#FAF0F8] px-2.5 py-1 text-[11px] font-semibold text-[#7C4C78]">
      <span className={`h-1.5 w-1.5 rounded-full ${BADGE_DOT[color] ?? BADGE_DOT.gray}`} />
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Public renderer
// ---------------------------------------------------------------------------

export default function A2UIRenderer({ spec }: { spec: A2UISpec }) {
  if (!spec?.nodes || !spec.root) return null;
  return (
    <div className="a2ui-renderer space-y-3">
      {renderNode(spec.root, spec.nodes)}
    </div>
  );
}
