import type { RunState } from '../game/types';

export interface TutorialStep {
  id: string;
  target: string;
  title: string;
  body: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
  /** When true, the step auto-advances once `isComplete(run)` returns true. */
  autoAdvance?: boolean;
  isComplete?: (run: RunState) => boolean;
}

export const tutorialSteps: TutorialStep[] = [
  {
    id: 'hud',
    target: '.command-deck .hud',
    title: 'This is your run status',
    body: 'Cash, net worth, reputation, XP, regime. Keep cash above zero or the run ends in bankruptcy.',
    placement: 'bottom'
  },
  {
    id: 'intel',
    target: '.stock-detail-panel',
    title: 'Read the tape',
    body: 'Signal Quality tells you how trustworthy this ticker is. Higher Volatility means options cost more but pay bigger on shocks.',
    placement: 'bottom'
  },
  {
    id: 'ticket',
    target: '.trade-ticket',
    title: 'Pick your strategy',
    body: 'Single calls/puts for directional bets. Spreads cap risk. Straddles play volatility either way. Earlier expiries (TUE/THU) are cheaper but less time to be right.',
    placement: 'left'
  },
  {
    id: 'advance',
    target: '.terminal-header button',
    title: 'Advance the day',
    body: 'Click Advance Day to move through the week. Watch out — Wednesday brings a market shock.',
    placement: 'left',
    autoAdvance: true,
    isComplete: (run) => Boolean(run.activeEvent)
  },
  {
    id: 'shock',
    target: '.event-card',
    title: 'The Wednesday shock',
    body: "An event card hit one of your tickers. Adjust before Friday — close options, hedge with the opposite side, or hold and pray.",
    placement: 'bottom',
    autoAdvance: true,
    isComplete: (run) => Boolean(run.weekResult)
  },
  {
    id: 'recap',
    target: '.recap-panel',
    title: 'Friday tells the story',
    body: 'Every Friday you get a recap: what each contract paid, how the shock landed, what to learn. Then Monday begins.',
    placement: 'left',
    autoAdvance: true,
    isComplete: (run) => Boolean(run.weekResult)
  }
];
