// Enums miroir du schéma Prisma (utilisables côté client)

export type NotePosition = "TOP" | "HEART" | "BASE";

export type Gender = "MASCULINE" | "FEMININE" | "UNISEX";

export type CollectionStatus = "OWNED" | "TRIED" | "WISHLIST" | "DECANT_WANTED";

export type Season = "SPRING" | "SUMMER" | "AUTUMN" | "WINTER";

export type Occasion = "OFFICE" | "EVENING" | "SPORT" | "DATE" | "CASUAL";

// Types de présentation (côté client, sans relations Prisma)

export interface HouseSummary {
  id: string;
  name: string;
  slug: string;
  country?: string;
  logoUrl?: string;
}

export interface PerfumerSummary {
  id: string;
  name: string;
  slug: string;
  photoUrl?: string;
}

export interface NoteSummary {
  id: string;
  name: string;
  slug: string;
  family?: string;
}

export interface AccordSummary {
  id: string;
  name: string;
  slug: string;
  color?: string;
  strength?: number;
}

export interface PerfumeSummary {
  id: string;
  name: string;
  slug: string;
  house: HouseSummary;
  year?: number;
  concentration?: string;
  imageUrl?: string;
  gender: Gender;
  averageRating?: number;
  reviewCount?: number;
  accords?: AccordSummary[];
}

export interface PerfumeDetail extends PerfumeSummary {
  description?: string;
  perfumers: PerfumerSummary[];
  topNotes: NoteSummary[];
  heartNotes: NoteSummary[];
  baseNotes: NoteSummary[];
}

export interface ReviewSummary {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  perfumeId: string;
  rating: number;
  longevity?: number;
  sillage?: number;
  valueForMoney?: number;
  seasons: Season[];
  occasions: Occasion[];
  blindBuy?: boolean;
  text?: string;
  wornAt?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  name?: string;
  bio?: string;
  avatar?: string;
  reviewCount: number;
  listCount: number;
  followerCount: number;
  followingCount: number;
  topAccords: AccordSummary[];
}
