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
    },
    narrativeArc: [
      'Industrial automation darling with sticky enterprise contracts.',
      'Big-three auto OEM rumored to expand its NVRA robot fleet next quarter.',
      'A union safety review opens questions about deployment timelines.',
      'Defense contract whispers reignite the "dual-use" thesis.'
    ]
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
    },
    narrativeArc: [
      'Cheap on multiples, but earnings have been choppy since the last guide.',
      'Activist letter argues the dividend is unsustainable; management pushes back.',
      'Surprise discovery in the Permian boosts proven reserves.',
      'Regulator launches review of FIZZ pipeline operations.'
    ]
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
    },
    narrativeArc: [
      'Steady regional builder. Sensitive to rates.',
      'New-home backlog hits multi-year high in southwest markets.',
      'Mortgage application data softens; analysts cut FY estimates.',
      'BRIK announces buyback authorization.'
    ]
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
    },
    narrativeArc: [
      'Long-dated government contracts; quiet but consistent.',
      'Multi-year radar contract award lifts the long-term outlook.',
      'Cost overruns on a hypersonic program weigh on the quarter.',
      'NATO partner orders accelerate the international book.'
    ]
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
    },
    narrativeArc: [
      'Pre-revenue biotech. Phase 3 readout could land any week.',
      'Sell-side flags PLSM as a binary trade — readout is now days away.',
      'Insider open-market buying triggers speculation.',
      'Partnership rumors with a big-pharma player swirl.'
    ]
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
    },
    narrativeArc: [
      'Boring brand portfolio. Boring usually wins.',
      'Premium snack acquisition closes; integration on track.',
      'Cocoa input costs spike; gross margin watch.',
      'Marketing refresh on legacy brand drives quiet upside.'
    ]
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
    },
    narrativeArc: [
      'Speculative AI infrastructure name. Wide valuation range.',
      'Tier-1 cloud customer renews the multi-year deal.',
      'Open-source competition raises questions about pricing power.',
      'Bankers reportedly shopping a strategic stake.'
    ]
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
    },
    narrativeArc: [
      'Government drone pipeline plus civilian logistics tailwind.',
      'FAA pilot program expands DRON delivery corridors.',
      'Foreign Military Sales backlog hits a new high.',
      'Battery supplier hiccup raises near-term delivery risk.'
    ]
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
    },
    narrativeArc: [
      'Comp sales softening; valuation has caught up to that story.',
      'Activist pushes for an asset spin-off.',
      'Holiday traffic data comes in better than feared.',
      'CEO succession process publicly announced.'
    ]
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
    },
    narrativeArc: [
      'Vaccine franchise with a partnered pipeline.',
      'Phase 2 readout for the lead asset hits primary endpoint.',
      'Manufacturing facility inspection raises FDA flags.',
      'Strategic partner doubles its R&D commitment.'
    ]
  },
  // --- New tickers below ---
  {
    symbol: 'KILN',
    name: 'Kiln Steel Works',
    sector: 'HOUSING',
    basePrice: 18,
    volatility: 0.12,
    quality: 0.44,
    fundamentals: {
      peRatio: 9,
      marketCap: 'SMALL',
      revenueGrowth: -8,
      dividendYield: 2.6,
      earningsThisWeek: false,
      narrative: 'Cyclical steel name. Closely tied to infrastructure spend.'
    },
    narrativeArc: [
      'Cyclical steel name. Closely tied to infrastructure spend.',
      'Federal infrastructure tranche releases — order books fatten.',
      'Tariff retaliation talks pressure export volume.',
      'Plant restart in Ohio comes in ahead of schedule.'
    ]
  },
  {
    symbol: 'HELI',
    name: 'Helios Solar',
    sector: 'ENERGY',
    basePrice: 12,
    volatility: 0.17,
    quality: 0.36,
    fundamentals: {
      peRatio: 0,
      marketCap: 'SMALL',
      revenueGrowth: 35,
      dividendYield: 0,
      earningsThisWeek: false,
      narrative: 'High-growth, high-volatility solar play. Beloved by retail.'
    },
    narrativeArc: [
      'High-growth, high-volatility solar play. Beloved by retail.',
      'IRS tax-credit guidance clears a key uncertainty.',
      'Component shortage delays a flagship utility-scale install.',
      'CEO does a long-form podcast; retail piles in.'
    ]
  },
  {
    symbol: 'CHIP',
    name: 'Chiplane Semi',
    sector: 'TECH',
    basePrice: 92,
    volatility: 0.09,
    quality: 0.7,
    fundamentals: {
      peRatio: 28,
      marketCap: 'MEGA',
      revenueGrowth: 19,
      dividendYield: 0.6,
      earningsThisWeek: false,
      narrative: 'Mega-cap fab. AI training cycle remains its tailwind.'
    },
    narrativeArc: [
      'Mega-cap fab. AI training cycle remains its tailwind.',
      'Lead customer raises capex guidance — order book expansion.',
      'Export-control headlines reignite geopolitical overhang.',
      'New node yield data leaks; sell-side gets excited.'
    ]
  },
  {
    symbol: 'CURR',
    name: 'Currency Cross Bank',
    sector: 'CONSUMER',
    basePrice: 41,
    volatility: 0.08,
    quality: 0.58,
    fundamentals: {
      peRatio: 13,
      marketCap: 'LARGE',
      revenueGrowth: 4,
      dividendYield: 3.5,
      earningsThisWeek: false,
      narrative: 'Regional bank with cross-border franchise. Sensitive to spreads.'
    },
    narrativeArc: [
      'Regional bank with cross-border franchise. Sensitive to spreads.',
      'Q3 net interest income rebounds with the curve.',
      'Commercial real-estate exposure draws short-seller attention.',
      'Stress test results clear; capital return resumes.'
    ]
  },
  {
    symbol: 'AURA',
    name: 'Auralink Devices',
    sector: 'TECH',
    basePrice: 67,
    volatility: 0.1,
    quality: 0.62,
    fundamentals: {
      peRatio: 33,
      marketCap: 'LARGE',
      revenueGrowth: 12,
      dividendYield: 0.4,
      earningsThisWeek: true,
      narrative: 'Consumer-electronics player with new wearable lineup.'
    },
    narrativeArc: [
      'Consumer-electronics player with new wearable lineup.',
      'Pre-orders for the next gen device blow past internal targets.',
      'Class-action over data privacy adds legal overhang.',
      'Holiday channel checks come in mixed.'
    ]
  },
  {
    symbol: 'TIDE',
    name: 'Tide Maritime',
    sector: 'ENERGY',
    basePrice: 26,
    volatility: 0.14,
    quality: 0.47,
    fundamentals: {
      peRatio: 7,
      marketCap: 'SMALL',
      revenueGrowth: 16,
      dividendYield: 4.2,
      earningsThisWeek: false,
      narrative: 'Shipping name with high yield. Rate-cycle leverage.'
    },
    narrativeArc: [
      'Shipping name with high yield. Rate-cycle leverage.',
      'Day-rate index spikes after a canal disruption.',
      'New-build tanker delivery delayed by yard issues.',
      'Special dividend declared after a strong quarter.'
    ]
  },
  {
    symbol: 'GENE',
    name: 'GeneLeap Therapeutics',
    sector: 'BIOTECH',
    basePrice: 23,
    volatility: 0.18,
    quality: 0.4,
    fundamentals: {
      peRatio: 0,
      marketCap: 'SMALL',
      revenueGrowth: 5,
      dividendYield: 0,
      earningsThisWeek: false,
      narrative: 'Pre-clinical platform with three shots on goal.'
    },
    narrativeArc: [
      'Pre-clinical platform with three shots on goal.',
      'IND filing accepted by the FDA for the lead candidate.',
      'Partner walks away from a co-development; stock fades.',
      'Conference presentation generates serious sell-side ink.'
    ]
  },
  {
    symbol: 'FORT',
    name: 'Fortify Cyber',
    sector: 'TECH',
    basePrice: 35,
    volatility: 0.1,
    quality: 0.56,
    fundamentals: {
      peRatio: 41,
      marketCap: 'MID',
      revenueGrowth: 24,
      dividendYield: 0,
      earningsThisWeek: false,
      narrative: 'Endpoint security SaaS. Subscription growth story.'
    },
    narrativeArc: [
      'Endpoint security SaaS. Subscription growth story.',
      'Government cyber mandate creates a new TAM tailwind.',
      'Competitor leak suggests FORT pricing under pressure.',
      'Q3 NRR comes in at a multi-year high.'
    ]
  },
  {
    symbol: 'PAWS',
    name: 'PawsPet Holdings',
    sector: 'CONSUMER',
    basePrice: 29,
    volatility: 0.08,
    quality: 0.6,
    fundamentals: {
      peRatio: 22,
      marketCap: 'MID',
      revenueGrowth: 8,
      dividendYield: 1.8,
      earningsThisWeek: false,
      narrative: 'Pet retail consolidator. Resilient through cycles.'
    },
    narrativeArc: [
      'Pet retail consolidator. Resilient through cycles.',
      'Tuck-in acquisition expands the rural footprint.',
      'Mass-market entrant compresses premium-food share.',
      'Loyalty program redesign drives a comp-sales pop.'
    ]
  },
  {
    symbol: 'LUME',
    name: 'Luminate Pharma',
    sector: 'BIOTECH',
    basePrice: 51,
    volatility: 0.11,
    quality: 0.6,
    fundamentals: {
      peRatio: 19,
      marketCap: 'LARGE',
      revenueGrowth: 8,
      dividendYield: 1.5,
      earningsThisWeek: false,
      narrative: 'Specialty pharma with a steady oncology cash cow.'
    },
    narrativeArc: [
      'Specialty pharma with a steady oncology cash cow.',
      'Patent extension granted on the flagship therapy.',
      'Generic entrant approaches; royalty stream at risk.',
      'M&A speculation lifts the stock late in the week.'
    ]
  }
];
