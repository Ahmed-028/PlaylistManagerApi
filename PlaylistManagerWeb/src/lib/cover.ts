import type { CSSProperties } from 'react'

/** FNV-1a with a murmur3 finalizer, so seeds differing by one character still look unrelated. */
function hash(seed: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16
  return h >>> 0
}

/**
 * Deterministic generated artwork. Keyed by id (not name) so renaming a playlist
 * keeps its cover, the way a record keeps its sleeve.
 */
export function coverStyle(seed: string): CSSProperties {
  const h = hash(seed)
  const base = h % 360
  const partner = (base + 35 + ((h >>> 9) % 70)) % 360
  const angle = (h >>> 3) % 360
  const x = 15 + ((h >>> 5) % 70)
  const y = 10 + ((h >>> 13) % 60)
  return {
    backgroundColor: `oklch(0.42 0.11 ${base})`,
    backgroundImage: [
      `radial-gradient(circle at ${x}% ${y}%, oklch(0.84 0.13 ${partner}) 0%, transparent 52%)`,
      `radial-gradient(circle at ${100 - x}% ${100 - y / 2}%, oklch(0.55 0.16 ${base}) 0%, transparent 60%)`,
      `conic-gradient(from ${angle}deg at 65% 35%, oklch(0.36 0.1 ${base}), oklch(0.6 0.15 ${partner}), oklch(0.3 0.08 ${base}), oklch(0.36 0.1 ${base}))`,
    ].join(', '),
  }
}
