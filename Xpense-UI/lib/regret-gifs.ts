import type { ImageSourcePropType } from 'react-native';

import type { TransactionType } from '@/lib/types';

export type RegretGifMeta = {
  source: ImageSourcePropType;
  title: string;
  caption: string;
};

/** Bundled GIFs (sourced from Tenor; wallet / money / luxury shopping). */
export const REGRET_GIFS: Record<TransactionType, RegretGifMeta> = {
  NECESSITY: {
    source: require('../assets/images/regret/necessity.gif'),
    title: 'Empty wallet energy',
    caption: 'Even the basics empty your pockets. This need still counts.',
  },
  MODERATE: {
    source: require('../assets/images/regret/moderate.gif'),
    title: 'There goes your money',
    caption: 'Not a disaster, not free either. That moderate spend still smarts.',
  },
  LUXURY: {
    source: require('../assets/images/regret/luxury.gif'),
    title: 'We don’t have the money for this',
    caption: 'Luxury sounded fun until the total showed up. Ouch.',
  },
};

export function regretGifFor(type: TransactionType) {
  return REGRET_GIFS[type];
}
