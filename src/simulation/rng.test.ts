import { describe, expect, it } from 'vitest';
import { createRng } from './rng';

describe('createRng', () => {
  it('returns the same sequence for the same seed', () => {
    const a = createRng(12345);
    const b = createRng(12345);

    expect([a.next(), a.next(), a.next()]).toEqual([b.next(), b.next(), b.next()]);
  });

  it('can pick deterministic array items', () => {
    const rng = createRng(7);

    expect(rng.pick(['alpha', 'beta', 'gamma'])).toBe('alpha');
  });
});
