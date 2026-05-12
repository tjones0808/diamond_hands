import type { CareerTier, SaveState } from '../game/types';
import { tierArtifacts, tierLabel } from '../content/tierRewards';

const tierIcons: Record<CareerTier, string> = {
  BEDROOM_DAY_TRADER: '☕',
  PROP_DESK_ROOKIE: '🏆',
  STOCK_BROKER: '🪪',
  FUND_MANAGER: '📰',
  HEDGE_FUND_FOUNDER: '🐂'
};

const tierOrder: CareerTier[] = [
  'BEDROOM_DAY_TRADER',
  'PROP_DESK_ROOKIE',
  'STOCK_BROKER',
  'FUND_MANAGER',
  'HEDGE_FUND_FOUNDER'
];

export function TrophyShelf({ save }: { save: SaveState }) {
  const reached = new Set(save.tiersEverReached);

  return (
    <aside className="trophy-shelf" aria-label="Trophy shelf">
      <header>
        <span>Trophies</span>
        <small>{reached.size}/{tierOrder.length}</small>
      </header>
      <ul>
        {tierOrder.map((tier) => {
          const unlocked = reached.has(tier);
          const artifact = tierArtifacts[tier];
          return (
            <li
              key={tier}
              className={unlocked ? 'trophy-item unlocked' : 'trophy-item locked'}
              data-tier={tier}
              data-unlocked={unlocked ? 'true' : 'false'}
              title={unlocked ? `${artifact.label} — ${artifact.description}` : `Locked — reach ${tierLabel(tier)}`}
            >
              <span className="trophy-icon" aria-hidden="true">{unlocked ? tierIcons[tier] : '·'}</span>
              <span className="trophy-label">{unlocked ? artifact.label : '???'}</span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
