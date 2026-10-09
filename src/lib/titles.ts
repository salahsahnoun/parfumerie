export interface Title {
  label: string;
  minReviews: number;
  next?: { label: string; at: number };
}

const TIERS: { label: string; minReviews: number }[] = [
  { label: "Nez Curieux",      minReviews: 0   },
  { label: "Amateur Éclairé",  minReviews: 5   },
  { label: "Passionné",        minReviews: 15  },
  { label: "Olfactophile",     minReviews: 30  },
  { label: "Expert Olfactif",  minReviews: 60  },
  { label: "Maître Parfumeur", minReviews: 100 },
];

export function getUserTitle(reviewCount: number): Title {
  let current = TIERS[0];
  for (const tier of TIERS) {
    if (reviewCount >= tier.minReviews) current = tier;
  }
  const idx = TIERS.indexOf(current);
  const nextTier = TIERS[idx + 1];
  return {
    ...current,
    next: nextTier
      ? { label: nextTier.label, at: nextTier.minReviews }
      : undefined,
  };
}

export const ALL_TIERS = TIERS;
