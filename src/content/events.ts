import type { GameEvent } from '../game/types';

export const eventDeck: GameEvent[] = [
  {
    id: 'fed-hot-mic',
    title: 'Fed Hot Mic',
    description: 'A leaked comment hints rates may stay higher than expected.',
    priceImpact: -0.07,
    volatilityImpact: 0.12,
    reputationImpact: 0
  },
  {
    id: 'meme-squeeze',
    title: 'Message Board Squeeze',
    description: 'Retail traders swarm the most-shorted ticker on your watchlist.',
    priceImpact: 0.18,
    volatilityImpact: 0.2,
    reputationImpact: 1
  },
  {
    id: 'short-report',
    title: 'Short Report',
    description: 'A famous short seller publishes a brutal thread before lunch.',
    priceImpact: -0.16,
    volatilityImpact: 0.16,
    reputationImpact: -1
  },
  {
    id: 'surprise-contract',
    title: 'Surprise Contract',
    description: 'A defense name wins a contract nobody priced in.',
    sector: 'DEFENSE',
    priceImpact: 0.11,
    volatilityImpact: 0.08,
    reputationImpact: 1
  }
];
