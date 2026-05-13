import { createPortal } from 'react-dom';
import type { SaveState } from '../game/types';
import { achievementDefinitions } from '../content/achievements';

export function AchievementsPanel({ save, onClose }: { save: SaveState; onClose: () => void }) {
  if (typeof document === 'undefined') return null;

  const unlockedMap = new Map(save.achievements.map((a) => [a.id, a]));
  const totalCount = achievementDefinitions.length;
  const unlockedCount = save.achievements.length;

  const modal = (
    <div className="hof-backdrop" role="dialog" aria-modal="true" aria-label="Achievements" onClick={onClose}>
      <section className="hof-panel achievements-panel" onClick={(event) => event.stopPropagation()}>
        <header>
          <div>
            <span>Achievements</span>
            <h2>{unlockedCount} / {totalCount} unlocked</h2>
          </div>
          <button type="button" aria-label="Close" onClick={onClose}>✕</button>
        </header>

        <ul className="ach-list">
          {achievementDefinitions.map((def) => {
            const unlock = unlockedMap.get(def.id);
            const unlocked = Boolean(unlock);
            return (
              <li key={def.id} className={unlocked ? 'ach-item unlocked' : 'ach-item locked'}>
                <div className="ach-icon" aria-hidden="true">{unlocked ? '🎖' : '🔒'}</div>
                <div className="ach-body">
                  <strong>{def.label}</strong>
                  <p>{def.description}</p>
                  {unlock ? (
                    <small>
                      Unlocked W{unlock.unlockedAtWeek} at {unlock.unlockedAtTier.replaceAll('_', ' ')}
                    </small>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );

  return createPortal(modal, document.body);
}
