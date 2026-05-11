export interface Rng {
  next(): number;
  int(minInclusive: number, maxInclusive: number): number;
  float(minInclusive: number, maxExclusive: number): number;
  pick<T>(items: readonly T[]): T;
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  function next() {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  return {
    next,
    int(minInclusive, maxInclusive) {
      return Math.floor(next() * (maxInclusive - minInclusive + 1)) + minInclusive;
    },
    float(minInclusive, maxExclusive) {
      return next() * (maxExclusive - minInclusive) + minInclusive;
    },
    pick(items) {
      if (items.length === 0) {
        throw new Error('Cannot pick from an empty array.');
      }
      return items[Math.floor(next() * items.length)];
    }
  };
}
