import { useEffect, useState } from 'react';
import AnchorChat from './AnchorChat';

/**
 * FloatingChatDrawer — bottom-right pill that expands into the chat panel.
 *
 * Replaces the right sidebar so the dashboard gets full page width. The pill
 * is always visible and pulses gently to invite interaction. Clicking opens
 * a 400px-wide drawer with the existing AnchorChat inside.
 *
 * Keyboard: Escape closes the drawer. Pill is keyboard-focusable.
 */
export default function FloatingChatDrawer() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      {/* Backdrop (mobile only — desktop drawer floats over content) */}
      {open && (
        <div
          className="fixed inset-0 bg-anchor-ink-900/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed z-50 transition-all duration-300 ease-out ${
          open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        } bottom-24 right-6 w-[calc(100vw-3rem)] sm:w-[400px] max-h-[calc(100vh-8rem)]`}
        role="dialog"
        aria-label="Tell Anchor"
        aria-hidden={!open}
      >
        <div className="relative">
          {/* Close button */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute -top-2 -right-2 z-10 w-7 h-7 rounded-full bg-white border border-anchor-mist-100 shadow-lift grid place-items-center text-anchor-mist-400 hover:text-anchor-ink-600 focus:outline-none focus:ring-4 focus:ring-anchor-indigo-200"
            aria-label="Close chat"
          >
            ✕
          </button>
          <AnchorChat />
        </div>
      </div>

      {/* Floating pill trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`fixed bottom-6 right-6 z-50 inline-flex items-center gap-2.5 px-5 py-3 rounded-full shadow-lift focus:outline-none focus:ring-4 focus:ring-anchor-indigo-200 transition-all ${
          open
            ? 'bg-white text-anchor-ink-600 border border-anchor-mist-100 hover:bg-anchor-cream-100'
            : 'bg-anchor-indigo-600 text-white hover:bg-anchor-indigo-700 hover:scale-105'
        }`}
        aria-expanded={open}
        aria-controls="anchor-chat-panel"
      >
        <span
          className={`relative grid place-items-center w-6 h-6 ${open ? '' : 'animate-pulse'}`}
          aria-hidden
        >
          {open ? (
            <span className="text-base leading-none">▾</span>
          ) : (
            <>
              <span className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
              <span className="relative text-base leading-none">✿</span>
            </>
          )}
        </span>
        <span className="font-semibold text-[13px]">
          {open ? 'Hide' : 'Tell Anchor'}
        </span>
      </button>
    </>
  );
}
