import type {
  BossWeekDefinition,
  BossWeekResolution,
  CareerTier,
  GameEvent,
  OptionResult,
  OptionStrategyType,
  StartingPerk,
  TierArtifact,
  WeekResult
} from '../game/types';

export interface BuildWeekResultInput {
  week: number;
  startNetWorth: number;
  endNetWorth: number;
  startCash: number;
  endCash: number;
  optionResults: OptionResult[];
  event?: GameEvent;
  reputationDelta: number;
  xpGained: number;
  promoted: boolean;
  promotedFromTier?: CareerTier;
  promotedToTier?: CareerTier;
  newArtifact?: TierArtifact;
  nextRunPerk?: StartingPerk;
  bossResolution?: BossWeekResolution;
  bossDefinition?: BossWeekDefinition;
}

export function buildWeekResult(input: BuildWeekResultInput): WeekResult {
  const optionResults = input.optionResults.map((result) => ({ ...result }));
  const optionsTotalPnl = round(optionResults.reduce((total, item) => total + item.pnl, 0));
  const netWorthDelta = round(input.endNetWorth - input.startNetWorth);
  const cashDelta = round(input.endCash - input.startCash);

  return {
    week: input.week,
    startNetWorth: round(input.startNetWorth),
    endNetWorth: round(input.endNetWorth),
    netWorthDelta,
    cashDelta,
    optionResults,
    optionsTotalPnl,
    eventTitle: input.event?.title,
    eventSymbol: input.event?.symbol,
    eventDescription: input.event?.description,
    reputationDelta: input.reputationDelta,
    xpGained: input.xpGained,
    promoted: input.promoted,
    promotedFromTier: input.promotedFromTier,
    promotedToTier: input.promotedToTier,
    newArtifact: input.newArtifact,
    nextRunPerk: input.nextRunPerk,
    bossResolution: input.bossResolution,
    bossDefinition: input.bossDefinition,
    lesson: buildLesson({ netWorthDelta, optionResults, optionsTotalPnl, event: input.event, promoted: input.promoted, bossResolution: input.bossResolution }),
    headline: buildHeadline({ netWorthDelta, optionResults, optionsTotalPnl, promoted: input.promoted, bossResolution: input.bossResolution })
  };
}

export function groupResultsByStrategy(results: OptionResult[]): Array<{
  strategyId: string;
  strategyType: OptionStrategyType;
  symbol: string;
  expiresDay: OptionResult['expiresDay'];
  legs: OptionResult[];
  totalPnl: number;
  totalRisk: number;
}> {
  const buckets = new Map<string, OptionResult[]>();
  for (const result of results) {
    const bucket = buckets.get(result.strategyId) ?? [];
    bucket.push(result);
    buckets.set(result.strategyId, bucket);
  }

  return Array.from(buckets.entries()).map(([strategyId, legs]) => {
    const first = legs[0];
    const totalPnl = round(legs.reduce((total, leg) => total + leg.pnl, 0));
    const totalRisk = round(legs.reduce((total, leg) => {
      return leg.side === 'LONG' ? total + leg.premiumPaid : total - leg.premiumPaid;
    }, 0));
    return {
      strategyId,
      strategyType: first.strategyType,
      symbol: first.symbol,
      expiresDay: first.expiresDay,
      legs,
      totalPnl,
      totalRisk
    };
  });
}

function buildHeadline(input: { netWorthDelta: number; optionResults: OptionResult[]; optionsTotalPnl: number; promoted: boolean; bossResolution?: BossWeekResolution }) {
  if (input.bossResolution?.passed) return 'Boss week cleared. The room changes.';
  if (input.bossResolution && !input.bossResolution.passed) return 'Boss week missed. Try again next eligibility window.';
  if (input.promoted) return 'Promotion week. The room changes.';
  if (input.netWorthDelta >= 1500) return 'You printed. Friday delivered.';
  if (input.netWorthDelta >= 250) return 'Quiet green. Bank it.';
  if (input.netWorthDelta <= -1500) return 'Tape buried you. Reset Monday.';
  if (input.netWorthDelta <= -250) return 'Bled a little. Cheap lesson.';
  if (input.optionResults.length > 0 && input.optionsTotalPnl > 0) return 'Options paid. Tape stayed kind.';
  if (input.optionResults.length > 0 && input.optionsTotalPnl < 0) return 'Premium burnt. Theta won.';
  return 'Flat week. Save the powder.';
}

function buildLesson(input: { netWorthDelta: number; optionResults: OptionResult[]; optionsTotalPnl: number; event?: GameEvent; promoted: boolean; bossResolution?: BossWeekResolution }) {
  const lessons: string[] = [];
  if (input.bossResolution) {
    lessons.push(input.bossResolution.summary);
  }
  const strategies = groupResultsByStrategy(input.optionResults);
  const winners = strategies.filter((strategy) => strategy.totalPnl > 0);
  const losers = strategies.filter((strategy) => strategy.totalPnl < 0);

  if (winners.length > 0) {
    const top = winners.reduce((best, current) => (current.totalPnl > best.totalPnl ? current : best));
    lessons.push(`${top.symbol} ${strategyDisplay(top.strategyType)} paid ${formatMoney(top.totalPnl)} for ${formatMoney(Math.abs(top.totalRisk))} risk.`);
  }

  if (losers.length > 0) {
    const worst = losers.reduce((bad, current) => (current.totalPnl < bad.totalPnl ? current : bad));
    lessons.push(`${worst.symbol} ${strategyDisplay(worst.strategyType)} lost ${formatMoney(Math.abs(worst.totalPnl))}.`);
  }

  if (input.event) {
    const direction = input.netWorthDelta >= 0 ? 'rode' : 'caught';
    lessons.push(`You ${direction} the ${input.event.title.toLowerCase()} shock.`);
  }

  if (input.promoted) {
    lessons.push('Promotion gates cleared. Bigger room, bigger pressure.');
  }

  if (lessons.length === 0) {
    lessons.push('No expiries, no shock damage. Use Monday to take a real swing.');
  }

  return lessons.join(' ');
}

function strategyDisplay(type: OptionStrategyType) {
  switch (type) {
    case 'SINGLE_CALL': return 'call';
    case 'SINGLE_PUT': return 'put';
    case 'CALL_SPREAD': return 'call spread';
    case 'PUT_SPREAD': return 'put spread';
    case 'STRADDLE': return 'straddle';
  }
}

function formatMoney(value: number) {
  const rounded = Math.abs(Math.round(value * 100) / 100);
  return `$${rounded.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
