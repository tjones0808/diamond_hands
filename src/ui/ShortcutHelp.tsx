import { createPortal } from 'react-dom';

const ROWS: { keys: string; action: string }[] = [
  { keys: '1–8', action: 'Select ticker in the watchlist' },
  { keys: 'Space', action: 'Advance Day / Settle Friday' },
  { keys: 'B', action: 'Buy (first matching trade button)' },
  { keys: 'S', action: 'Sell shares' },
  { keys: 'C', action: 'Close options on selected ticker' },
  { keys: 'M', action: 'Toggle audio mute' },
  { keys: 'J', action: 'Open Run Journal' },
  { keys: 'Esc', action: 'Pause / dismiss modal' },
  { keys: '?', action: 'Toggle this cheatsheet' }
];

export function ShortcutHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  if (typeof document === 'undefined') return null;

  const overlay = (
    <div className="shortcut-help-backdrop" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" onClick={onClose}>
      <section className="shortcut-help-panel" onClick={(event) => event.stopPropagation()}>
        <header>
          <h2>Keyboard shortcuts</h2>
          <button type="button" aria-label="Close" onClick={onClose}>✕</button>
        </header>
        <ul>
          {ROWS.map((row) => (
            <li key={row.keys}>
              <kbd>{row.keys}</kbd>
              <span>{row.action}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );

  return createPortal(overlay, document.body);
}
