export type WeekDay = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI';
export type Sector = 'TECH' | 'ENERGY' | 'BIOTECH' | 'HOUSING' | 'DEFENSE' | 'CONSUMER';
export type MarketRegime = 'CALM' | 'EARNINGS_STORM' | 'FED_WEEK' | 'CRASH_WATCH' | 'MELT_UP' | 'MEME_MANIA';
export type CareerTier = 'BEDROOM_DAY_TRADER' | 'PROP_DESK_ROOKIE' | 'STOCK_BROKER' | 'FUND_MANAGER' | 'HEDGE_FUND_FOUNDER';
export type InstrumentType = 'SHARE' | 'CALL' | 'PUT';

export type MarketCap = 'SMALL' | 'MID' | 'LARGE' | 'MEGA';
export type AnalystRating = 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';

export interface TickerFundamentals {
  peRatio: number;
  marketCap: MarketCap;
  revenueGrowth: number;
  dividendYield: number;
  earningsThisWeek: boolean;
  narrative: string;
}

export interface TickerSnapshot {
  analystRating: AnalystRating;
  analystTargetPct: number;
  shortInterestPct: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  recentHeadlines: string[];
}

export interface TickerDefinition {
  symbol: string;
  name: string;
  sector: Sector;
  basePrice: number;
  volatility: number;
  quality: number;
  fundamentals: TickerFundamentals;
  /** Recurring narrative arcs for this ticker. Index = (seed + week) % length so it cycles deterministically. */
  narrativeArc?: string[];
}

export interface PricePoint {
  day: WeekDay;
  price: number; // close, kept for back-compat
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketTicker {
  definition: TickerDefinition;
  prices: PricePoint[];
  priorHistory: PricePoint[];
  signal: string;
  snapshot: TickerSnapshot;
}

export type OptionSide = 'LONG' | 'SHORT';
export type OptionExpiryDay = 'TUE' | 'THU' | 'FRI';
export type OptionStrategyType = 'SINGLE_CALL' | 'SINGLE_PUT' | 'CALL_SPREAD' | 'PUT_SPREAD' | 'STRADDLE';

export interface OptionContract {
  id: string;
  symbol: string;
  type: 'CALL' | 'PUT';
  side: OptionSide;
  strike: number;
  premium: number;
  quantity: number;
  openedDay: WeekDay;
  expiresDay: OptionExpiryDay;
  strategyId: string;
  strategyType: OptionStrategyType;
}

export interface SharePosition {
  symbol: string;
  quantity: number;
  averagePrice: number;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  sector?: Sector;
  symbol?: string;
  priceImpact: number;
  volatilityImpact: number;
  reputationImpact: number;
}

export interface UnlockState {
  betterNewsFeed: boolean;
  secondMonitor: boolean;
}

export interface OptionResult {
  symbol: string;
  type: 'CALL' | 'PUT';
  side: OptionSide;
  strike: number;
  quantity: number;
  premiumPaid: number;
  settlementValue: number;
  pnl: number;
  expiredInTheMoney: boolean;
  expiresDay: OptionExpiryDay;
  strategyId: string;
  strategyType: OptionStrategyType;
}

export interface WeekResult {
  week: number;
  startNetWorth: number;
  endNetWorth: number;
  netWorthDelta: number;
  cashDelta: number;
  optionResults: OptionResult[];
  optionsTotalPnl: number;
  eventTitle?: string;
  eventSymbol?: string;
  eventDescription?: string;
  reputationDelta: number;
  xpGained: number;
  promoted: boolean;
  promotedFromTier?: CareerTier;
  promotedToTier?: CareerTier;
  newArtifact?: TierArtifact;
  nextRunPerk?: StartingPerk;
  bossResolution?: BossWeekResolution;
  bossDefinition?: BossWeekDefinition;
  balancedTrader?: boolean;
  weekFundamentalTrades?: number;
  weekTechnicalTrades?: number;
  lesson: string;
  headline: string;
}

export interface TierArtifact {
  tier: CareerTier;
  label: string;
  description: string;
}

export interface StartingPerk {
  bonusCash: number;
  bonusReputation: number;
  description: string;
}

export interface RunState {
  seed: number;
  week: number;
  day: WeekDay;
  tier: CareerTier;
  cash: number;
  reputation: number;
  xp: number;
  marketRegime: MarketRegime;
  tickers: MarketTicker[];
  sharePositions: SharePosition[];
  optionPositions: OptionContract[];
  activeEvent?: GameEvent;
  isBankrupt: boolean;
  weekLog: string[];
  weekResult?: WeekResult;
  weekOptionResults: OptionResult[];
  bossWeek?: BossWeekState;
  fundamentalScore: number;
  technicalScore: number;
  weekFundamentalScore: number;
  weekTechnicalScore: number;
  stress: number;
  confidence: number;
  marginUsed: number;
  /** Full bar history per ticker symbol. Accumulates across weeks so charts stay continuous. */
  tickerSeries: Record<string, PricePoint[]>;
  /** Net worth captured at the START of this week (Monday open). Used to compute the true weekly delta. */
  weekStartNetWorth: number;
  /** Cash captured at the START of this week (Monday open). */
  weekStartCash: number;
  restingOrders: RestingOrder[];
  clients: Client[];
}

export type RiskTolerance = 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';

export interface ClientTemplate {
  id: string;
  name: string;
  backstory: string;
  riskTolerance: RiskTolerance;
}

export interface Client extends ClientTemplate {
  /** Capital you manage on their behalf. */
  balance: number;
  /** Initial balance — used to detect redemption-triggering drawdown. */
  startingBalance: number;
  /** 0–100. Drops on bad weeks, recovers on good. At 0 they redeem. */
  patience: number;
  /** Weeks this client has been with you. */
  weeksWithYou: number;
  /** Fee earned from this client over the run (running total, informational). */
  lifetimeFeesPaid: number;
}

export type RestingOrderType = 'STOP_LOSS' | 'LIMIT_BUY' | 'LIMIT_SELL';

export interface RestingOrder {
  id: string;
  type: RestingOrderType;
  symbol: string;
  triggerPrice: number;
  quantity: number;
  createdDay: WeekDay;
  createdWeek: number;
}

export interface BossWeekDefinition {
  forTier: CareerTier;
  title: string;
  intro: string;
  netWorthTarget: number;
  requirementSummary: string;
  failurePenalty: { reputation: number; cash: number };
}

export interface BossWeekState {
  definition: BossWeekDefinition;
  startedAtWeek: number;
  resolved?: BossWeekResolution;
}

export interface BossWeekResolution {
  passed: boolean;
  endNetWorth: number;
  shortfall: number;
  reputationDelta: number;
  cashDelta: number;
  summary: string;
}

export interface SaveState {
  unlocks: UnlockState;
  bestNetWorth: number;
  runsCompleted: number;
  hasCompletedTutorial: boolean;
  tiersEverReached: CareerTier[];
  highestTier: CareerTier;
  audioMuted: boolean;
  stats: LifetimeStats;
  recentRuns: RunSummary[];
  settings: SettingsState;
}

export interface SettingsState {
  sfxVolume: number;       // 0-1
  musicVolume: number;     // 0-1
  reducedMotion: boolean;  // disable big animations
  colorBlindPalette: boolean; // swap green/red for protan-friendly colors
}

export interface LifetimeStats {
  totalRuns: number;
  totalBankruptcies: number;
  totalPromotions: number;
  totalBossWeeksPassed: number;
  totalBossWeeksFailed: number;
  totalWeeksSurvived: number;
  biggestSingleWeekGain: number;
  biggestSingleWeekLoss: number;
  totalFundamentalTrades: number;
  totalTechnicalTrades: number;
  totalBalancedWeeks: number;
}

export interface RunSummary {
  seed: number;
  endedAtWeek: number;
  endedTier: CareerTier;
  endNetWorth: number;
  endedInBankruptcy: boolean;
  endedAt: string;
}

export interface GameState {
  run: RunState;
  save: SaveState;
}
