import type { RunState } from '../game/types';

export interface MoodEffects {
  /** Multiplier on option premium quotes (>1 = more expensive when stressed). */
  premiumMultiplier: number;
  /** Multiplier on perceived signal quality % (less when stressed). */
  signalQualityMultiplier: number;
  label: 'CALM' | 'FOCUSED' | 'SHARP' | 'TENSE' | 'RATTLED';
  description: string;
}

const STRESS_MAX = 100;
const CONFIDENCE_MAX = 100;

export function applyMoodAfterWeek(run: RunState, netWorthDelta: number, bossPassed: boolean | undefined): RunState {
  let stress = run.stress;
  let confidence = run.confidence;

  // Decay each week so mood reflects recent action, not ancient history.
  stress = Math.max(0, stress * 0.7);
  confidence = Math.max(0, confidence * 0.75);

  if (netWorthDelta <= -1500) stress += 28;
  else if (netWorthDelta <= -500) stress += 14;
  else if (netWorthDelta <= -100) stress += 6;
  else if (netWorthDelta >= 1500) confidence += 22;
  else if (netWorthDelta >= 500) confidence += 12;
  else if (netWorthDelta >= 100) confidence += 5;

  if (bossPassed === true) confidence += 18;
  if (bossPassed === false) stress += 18;

  return {
    ...run,
    stress: Math.min(STRESS_MAX, Math.round(stress)),
    confidence: Math.min(CONFIDENCE_MAX, Math.round(confidence))
  };
}

export function getMoodEffects(run: { stress: number; confidence: number }): MoodEffects {
  const net = run.confidence - run.stress;

  // Premium multiplier: stress widens premiums (street smells fear), confidence tightens them.
  const premiumMultiplier = 1 + (run.stress / STRESS_MAX) * 0.18 - (run.confidence / CONFIDENCE_MAX) * 0.08;

  // Signal quality perception: stress dims signal, confidence boosts it.
  const signalQualityMultiplier = 1 - (run.stress / STRESS_MAX) * 0.22 + (run.confidence / CONFIDENCE_MAX) * 0.12;

  let label: MoodEffects['label'];
  let description: string;
  if (net >= 40) {
    label = 'SHARP';
    description = 'Confidence is high. Tape reads clean, premiums look fair.';
  } else if (net >= 15) {
    label = 'FOCUSED';
    description = 'Riding a good run. Reading the tape feels easy.';
  } else if (net >= -15) {
    label = 'CALM';
    description = 'Neutral mood. Trust your process.';
  } else if (net >= -40) {
    label = 'TENSE';
    description = 'Recent losses are weighing. Premiums look expensive, signals look noisy.';
  } else {
    label = 'RATTLED';
    description = 'You can feel the pressure. Sit small or sit out.';
  }

  return {
    premiumMultiplier: Math.max(0.85, Math.min(1.25, premiumMultiplier)),
    signalQualityMultiplier: Math.max(0.7, Math.min(1.18, signalQualityMultiplier)),
    label,
    description
  };
}
