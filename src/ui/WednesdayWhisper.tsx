import type { RunState, SaveState } from '../game/types';
import { buildWednesdayHint } from '../market/shockPreview';

export function WednesdayWhisper({ run, save }: { run: RunState; save: SaveState }) {
  if (!save.unlocks.betterNewsFeed) return null;
  if (run.day === 'WED' || run.day === 'THU' || run.day === 'FRI') return null;

  const hint = buildWednesdayHint(run);
  if (!hint) return null;

  return (
    <aside className={`whisper-card whisper-${hint.tone}`} aria-label="Wednesday whisper">
      <div>
        <span>NEWS FEED WHISPER</span>
        <strong>{hint.headline}</strong>
      </div>
      <em className={hint.tone === 'bull' ? 'gain' : hint.tone === 'bear' ? 'loss' : ''}>
        {hint.tone.toUpperCase()}
      </em>
    </aside>
  );
}
