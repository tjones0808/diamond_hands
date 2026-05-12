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
  },
  {
    id: 'fda-rejection',
    title: 'FDA Rejection',
    description: 'A biotech name eats a surprise complete-response letter.',
    sector: 'BIOTECH',
    priceImpact: -0.22,
    volatilityImpact: 0.24,
    reputationImpact: -1
  },
  {
    id: 'breakthrough-trial',
    title: 'Breakthrough Trial',
    description: 'Phase 3 data leaks and the print is much cleaner than the street modeled.',
    sector: 'BIOTECH',
    priceImpact: 0.21,
    volatilityImpact: 0.18,
    reputationImpact: 1
  },
  {
    id: 'oil-shock',
    title: 'OPEC Surprise Cut',
    description: 'A surprise output cut sends energy names ripping into close.',
    sector: 'ENERGY',
    priceImpact: 0.14,
    volatilityImpact: 0.14,
    reputationImpact: 0
  },
  {
    id: 'pipeline-leak',
    title: 'Pipeline Headline',
    description: 'An overnight refinery accident leaves an energy name in cleanup mode.',
    sector: 'ENERGY',
    priceImpact: -0.12,
    volatilityImpact: 0.14,
    reputationImpact: 0
  },
  {
    id: 'rate-cut-hint',
    title: 'Dovish Whisper',
    description: 'A Fed governor signals the cut cycle is closer than the dot plot.',
    priceImpact: 0.09,
    volatilityImpact: 0.06,
    reputationImpact: 0
  },
  {
    id: 'cpi-hot',
    title: 'CPI Comes In Hot',
    description: 'Inflation reaccelerates and the curve repricing hits risk assets.',
    priceImpact: -0.08,
    volatilityImpact: 0.18,
    reputationImpact: 0
  },
  {
    id: 'ceo-scandal',
    title: 'CEO Scandal',
    description: 'A leaked deposition torches confidence in management overnight.',
    priceImpact: -0.18,
    volatilityImpact: 0.22,
    reputationImpact: -1
  },
  {
    id: 'analyst-upgrade',
    title: 'Top Analyst Upgrade',
    description: 'A bulge-bracket analyst flips bullish with a screaming price target.',
    priceImpact: 0.1,
    volatilityImpact: 0.06,
    reputationImpact: 1
  },
  {
    id: 'analyst-downgrade',
    title: 'Brutal Downgrade',
    description: 'An influential analyst cuts a name to underweight with a slashed PT.',
    priceImpact: -0.1,
    volatilityImpact: 0.08,
    reputationImpact: 0
  },
  {
    id: 'housing-data',
    title: 'Permits Roll Over',
    description: 'Housing starts disappoint and homebuilders catch a soft bid.',
    sector: 'HOUSING',
    priceImpact: -0.09,
    volatilityImpact: 0.07,
    reputationImpact: 0
  },
  {
    id: 'rate-relief',
    title: 'Rate Relief Bid',
    description: 'A 10-year tail down sends homebuilders into a rip-your-face squeeze.',
    sector: 'HOUSING',
    priceImpact: 0.13,
    volatilityImpact: 0.1,
    reputationImpact: 0
  },
  {
    id: 'chip-glut',
    title: 'Chip Glut Warning',
    description: 'A major semi guides down on inventory glut. The tape gets thin.',
    sector: 'TECH',
    priceImpact: -0.13,
    volatilityImpact: 0.14,
    reputationImpact: 0
  },
  {
    id: 'ai-spend-surge',
    title: 'AI Spend Surge',
    description: 'A hyperscaler raises capex guidance. Anything AI-adjacent goes vertical.',
    sector: 'TECH',
    priceImpact: 0.17,
    volatilityImpact: 0.16,
    reputationImpact: 1
  },
  {
    id: 'consumer-strength',
    title: 'Retail Sales Beat',
    description: 'Consumers refuse to die. Discretionary names get a relief bid.',
    sector: 'CONSUMER',
    priceImpact: 0.08,
    volatilityImpact: 0.05,
    reputationImpact: 0
  },
  {
    id: 'recession-scare',
    title: 'Recession Scare',
    description: 'A regional bank warning drags the whole tape into the close.',
    priceImpact: -0.15,
    volatilityImpact: 0.2,
    reputationImpact: -1
  },
  {
    id: 'activist-stake',
    title: 'Activist Discloses Stake',
    description: 'A famous activist files a 13D and pushes a breakup thesis.',
    priceImpact: 0.12,
    volatilityImpact: 0.12,
    reputationImpact: 1
  },
  {
    id: 'shipping-crunch',
    title: 'Shipping Crunch',
    description: 'A canal disruption snarls consumer supply chains overnight.',
    sector: 'CONSUMER',
    priceImpact: -0.07,
    volatilityImpact: 0.09,
    reputationImpact: 0
  },
  {
    id: 'sovereign-downgrade',
    title: 'Sovereign Downgrade',
    description: 'A major rating agency cuts the federal outlook. Risk-off broadly.',
    priceImpact: -0.06,
    volatilityImpact: 0.14,
    reputationImpact: 0
  },
  {
    id: 'mega-merger',
    title: 'Mega Merger Leak',
    description: 'A bulge-bracket M&A rumor hits the tape pre-open.',
    priceImpact: 0.14,
    volatilityImpact: 0.16,
    reputationImpact: 1
  },
  {
    id: 'cyber-breach',
    title: 'Industry Cyber Breach',
    description: 'A coordinated breach hits multiple tech names. Sector under pressure.',
    sector: 'TECH',
    priceImpact: -0.11,
    volatilityImpact: 0.17,
    reputationImpact: -1
  },
  {
    id: 'inflation-cool',
    title: 'CPI Cools Down',
    description: 'Inflation print comes in soft. Rate-sensitive names rally.',
    priceImpact: 0.08,
    volatilityImpact: 0.06,
    reputationImpact: 0
  },
  {
    id: 'commodity-spike',
    title: 'Commodity Shock',
    description: 'A geopolitical flashpoint sends oil + metals sharply higher.',
    sector: 'ENERGY',
    priceImpact: 0.12,
    volatilityImpact: 0.15,
    reputationImpact: 0
  },
  {
    id: 'tax-policy',
    title: 'Tax Policy Surprise',
    description: 'Surprise corporate-tax bill leaks. Margins repriced across the board.',
    priceImpact: -0.05,
    volatilityImpact: 0.08,
    reputationImpact: 0
  },
  {
    id: 'fda-approval',
    title: 'Surprise FDA Approval',
    description: 'A second-line drug gets surprise approval; entire biotech tape ramps.',
    sector: 'BIOTECH',
    priceImpact: 0.18,
    volatilityImpact: 0.16,
    reputationImpact: 1
  },
  {
    id: 'consumer-confidence',
    title: 'Consumer Confidence Collapse',
    description: 'University survey pegs consumer sentiment at a 12-month low.',
    sector: 'CONSUMER',
    priceImpact: -0.08,
    volatilityImpact: 0.1,
    reputationImpact: 0
  },
  {
    id: 'gov-shutdown',
    title: 'Government Shutdown Risk',
    description: 'Continuing-resolution talks collapse. Defense and consumer wobble.',
    priceImpact: -0.07,
    volatilityImpact: 0.12,
    reputationImpact: 0
  },
  {
    id: 'tech-meltdown',
    title: 'Hyperscaler Capex Cut',
    description: 'A top hyperscaler cuts FY capex. Semis and infra names dump.',
    sector: 'TECH',
    priceImpact: -0.14,
    volatilityImpact: 0.15,
    reputationImpact: -1
  },
  {
    id: 'green-subsidy',
    title: 'Green Subsidy Expansion',
    description: 'Renewable tax credits get expanded; clean-energy names rip.',
    sector: 'ENERGY',
    priceImpact: 0.16,
    volatilityImpact: 0.12,
    reputationImpact: 1
  },
  {
    id: 'mortgage-spike',
    title: 'Mortgage Rates Spike',
    description: 'Long bonds sell off hard; mortgage rates jump 40bps in a day.',
    sector: 'HOUSING',
    priceImpact: -0.12,
    volatilityImpact: 0.1,
    reputationImpact: 0
  },
  {
    id: 'defense-budget',
    title: 'Defense Budget Surprise',
    description: 'Committee marks defense spending higher than expected.',
    sector: 'DEFENSE',
    priceImpact: 0.1,
    volatilityImpact: 0.08,
    reputationImpact: 1
  },
  {
    id: 'auto-recall',
    title: 'Auto Recall Cascade',
    description: 'A high-profile recall drags consumer durables and auto-adjacent names.',
    sector: 'CONSUMER',
    priceImpact: -0.09,
    volatilityImpact: 0.11,
    reputationImpact: 0
  }
];
