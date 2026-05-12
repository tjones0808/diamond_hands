import type { TickerDefinition } from '../game/types';

export const tickerDefinitions: TickerDefinition[] = [
  {
    symbol: 'NVRA',
    name: 'Novara Robotics',
    sector: 'TECH',
    basePrice: 48,
    volatility: 0.08,
    quality: 0.72,
    fundamentals: {
      peRatio: 38,
      marketCap: 'LARGE',
      revenueGrowth: 22,
      dividendYield: 0,
      earningsThisWeek: false,
      narrative: 'Industrial automation darling with sticky enterprise contracts.'
    }
  },
  {
    symbol: 'FIZZ',
    name: 'Fizzline Energy',
    sector: 'ENERGY',
    basePrice: 31,
    volatility: 0.13,
    quality: 0.41,
    fundamentals: {
      peRatio: 11,
      marketCap: 'MID',
      revenueGrowth: -4,
      dividendYield: 3.2,
      earningsThisWeek: false,
      narrative: 'Cheap on multiples, but earnings have been choppy since the last guide.'
    }
  },
  {
    symbol: 'BRIK',
    name: 'Brikwell Homes',
    sector: 'HOUSING',
    basePrice: 22,
    volatility: 0.06,
    quality: 0.55,
    fundamentals: {
      peRatio: 14,
      marketCap: 'MID',
      revenueGrowth: 5,
      dividendYield: 2.1,
      earningsThisWeek: false,
      narrative: 'Steady regional builder. Sensitive to rates.'
    }
  },
  {
    symbol: 'ORBX',
    name: 'Orbix Defense',
    sector: 'DEFENSE',
    basePrice: 74,
    volatility: 0.05,
    quality: 0.68,
    fundamentals: {
      peRatio: 22,
      marketCap: 'LARGE',
      revenueGrowth: 9,
      dividendYield: 1.4,
      earningsThisWeek: false,
      narrative: 'Long-dated government contracts; quiet but consistent.'
    }
  },
  {
    symbol: 'PLSM',
    name: 'PulseMint Bio',
    sector: 'BIOTECH',
    basePrice: 18,
    volatility: 0.16,
    quality: 0.38,
    fundamentals: {
      peRatio: 0,
      marketCap: 'SMALL',
      revenueGrowth: 1,
      dividendYield: 0,
      earningsThisWeek: true,
      narrative: 'Pre-revenue biotech. Phase 3 readout could land any week.'
    }
  },
  {
    symbol: 'SNAX',
    name: 'SnackForge Brands',
    sector: 'CONSUMER',
    basePrice: 39,
    volatility: 0.07,
    quality: 0.61,
    fundamentals: {
      peRatio: 25,
      marketCap: 'LARGE',
      revenueGrowth: 7,
      dividendYield: 2.8,
      earningsThisWeek: false,
      narrative: 'Boring brand portfolio. Boring usually wins.'
    }
  },
  {
    symbol: 'QBIT',
    name: 'Qubit Harbor',
    sector: 'TECH',
    basePrice: 57,
    volatility: 0.11,
    quality: 0.49,
    fundamentals: {
      peRatio: 64,
      marketCap: 'MID',
      revenueGrowth: 18,
      dividendYield: 0,
      earningsThisWeek: false,
      narrative: 'Speculative AI infrastructure name. Wide valuation range.'
    }
  },
  {
    symbol: 'DRON',
    name: 'AeroDrone Systems',
    sector: 'DEFENSE',
    basePrice: 63,
    volatility: 0.09,
    quality: 0.58,
    fundamentals: {
      peRatio: 28,
      marketCap: 'LARGE',
      revenueGrowth: 14,
      dividendYield: 1.0,
      earningsThisWeek: false,
      narrative: 'Government drone pipeline plus civilian logistics tailwind.'
    }
  },
  {
    symbol: 'GLMR',
    name: 'Glimmer Retail',
    sector: 'CONSUMER',
    basePrice: 27,
    volatility: 0.1,
    quality: 0.46,
    fundamentals: {
      peRatio: 19,
      marketCap: 'MID',
      revenueGrowth: 3,
      dividendYield: 1.6,
      earningsThisWeek: true,
      narrative: 'Comp sales softening; valuation has caught up to that story.'
    }
  },
  {
    symbol: 'VACC',
    name: 'Vactera Labs',
    sector: 'BIOTECH',
    basePrice: 44,
    volatility: 0.14,
    quality: 0.52,
    fundamentals: {
      peRatio: 30,
      marketCap: 'MID',
      revenueGrowth: 12,
      dividendYield: 0,
      earningsThisWeek: false,
      narrative: 'Vaccine franchise with a partnered pipeline.'
    }
  }
];
