export type WeekDay = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI';
export type Sector = 'TECH' | 'ENERGY' | 'BIOTECH' | 'HOUSING' | 'DEFENSE' | 'CONSUMER';
export type MarketRegime = 'CALM' | 'EARNINGS_STORM' | 'FED_WEEK' | 'CRASH_WATCH' | 'MELT_UP' | 'MEME_MANIA';
export type CareerTier = 'BEDROOM_DAY_TRADER' | 'PROP_DESK_ROOKIE' | 'STOCK_BROKER' | 'FUND_MANAGER' | 'HEDGE_FUND_FOUNDER';
export type InstrumentType = 'SHARE' | 'CALL' | 'PUT';

export interface TickerDefinition {
  symbol: string;
  name: string;
  sector: Sector;
  basePrice: number;
  volatility: number;
  quality: number;
}

export interface PricePoint {
  day: WeekDay;
  price: number;
}

export interface MarketTicker {
  definition: TickerDefinition;
  prices: PricePoint[];
  signal: string;
}

export interface OptionContract {
  id: string;
  symbol: string;
  type: 'CALL' | 'PUT';
  strike: number;
  premium: number;
  quantity: number;
  openedDay: WeekDay;
  expiresDay: 'FRI';
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
}

export interface SaveState {
  unlocks: UnlockState;
  bestNetWorth: number;
  runsCompleted: number;
}

export interface GameState {
  run: RunState;
  save: SaveState;
}
