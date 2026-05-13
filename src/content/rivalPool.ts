import type { RivalPersonality } from '../game/types';

export interface RivalTemplate {
  id: string;
  name: string;
  personality: RivalPersonality;
  /** Trash talk on your bad weeks. */
  jeer: string;
  /** Grudging respect on your big weeks. */
  cheer: string;
  /** Bragging line when they have a great week. */
  brag: string;
}

export const rivalPool: RivalTemplate[] = [
  {
    id: 'marco',
    name: 'Aggressive Marco',
    personality: 'AGGRESSIVE',
    jeer: 'Marco posts: lol who taught you to size?',
    cheer: 'Marco grudgingly admits the print is clean.',
    brag: 'Marco brags about a 30% week. Of course.'
  },
  {
    id: 'beth',
    name: 'Cautious Beth',
    personality: 'CAUTIOUS',
    jeer: 'Beth quietly suggests you read more annual reports.',
    cheer: 'Beth nods. "Disciplined play, that one."',
    brag: 'Beth notes her drawdowns are smaller than yours.'
  },
  {
    id: 'pat',
    name: 'Disciplined Pat',
    personality: 'DISCIPLINED',
    jeer: 'Pat: "Stops exist for a reason, kid."',
    cheer: 'Pat raises an eyebrow. Decent week.',
    brag: 'Pat shares their consistency stats. Insufferable.'
  },
  {
    id: 'rj',
    name: 'RJ "Risk-On"',
    personality: 'AGGRESSIVE',
    jeer: 'RJ posts a meme of you blowing up.',
    cheer: 'RJ DMs: "ok I see you."',
    brag: 'RJ "Risk-On" is bragging about leverage again.'
  },
  {
    id: 'liz',
    name: 'Liz the Quant',
    personality: 'DISCIPLINED',
    jeer: 'Liz the Quant runs your stats on a napkin and frowns.',
    cheer: 'Liz the Quant says your Sharpe was almost respectable.',
    brag: 'Liz the Quant posts a regression chart and calls it modest.'
  },
  {
    id: 'sergei',
    name: 'Sergei the Hedger',
    personality: 'CAUTIOUS',
    jeer: 'Sergei suggests you would benefit from a put spread.',
    cheer: 'Sergei is impressed you survived intact.',
    brag: 'Sergei takes a long lunch — fully hedged, smug.'
  }
];
