import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";

// Cache 60 secondes — toutes les requêtes catalogue lourdes passent par ici

export const getCatalogPerfumes = unstable_cache(
  async (q?: string, accord?: string) => {
    return prisma.perfume.findMany({
      where: {
        AND: [
          q ? { OR: [
            { name: { contains: q, mode: "insensitive" } },
            { house: { name: { contains: q, mode: "insensitive" } } },
          ]} : {},
          accord ? { accords: { some: { accord: { name: { equals: accord, mode: "insensitive" } } } } } : {},
        ],
      },
      include: {
        house: { select: { name: true } },
        accords: { include: { accord: { select: { name: true } } }, orderBy: { strength: "desc" } },
        reviews: { select: { rating: true } },
      },
      orderBy: { name: "asc" },
    });
  },
  ["catalog-perfumes"],
  { revalidate: 60, tags: ["perfumes"] }
);

export const getMaisons = unstable_cache(
  async (q?: string) => {
    return prisma.house.findMany({
      where: q ? { name: { contains: q, mode: "insensitive" } } : undefined,
      include: { _count: { select: { perfumes: true } } },
      orderBy: { name: "asc" },
    });
  },
  ["maisons"],
  { revalidate: 120, tags: ["maisons"] }
);

export const getParfumeurs = unstable_cache(
  async (q?: string) => {
    return prisma.perfumer.findMany({
      where: q ? { name: { contains: q, mode: "insensitive" } } : undefined,
      include: { _count: { select: { perfumes: true } } },
      orderBy: { name: "asc" },
    });
  },
  ["parfumeurs"],
  { revalidate: 120, tags: ["parfumeurs"] }
);

export const getHomepageData = unstable_cache(
  async () => {
    return Promise.all([
      prisma.perfume.findMany({
        take: 14,
        orderBy: { createdAt: "desc" },
        include: {
          house: { select: { name: true } },
          reviews: { select: { rating: true } },
        },
      }),
      prisma.review.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { username: true } },
          perfume: {
            select: { name: true, slug: true, imageUrl: true, house: { select: { name: true } } },
          },
        },
      }),
    ]);
  },
  ["homepage"],
  { revalidate: 60, tags: ["perfumes", "reviews"] }
);

export const getPerfumePage = unstable_cache(
  async (slug: string) => {
    return prisma.perfume.findUnique({
      where: { slug },
      include: {
        house: true,
        perfumers: { include: { perfumer: true } },
        notes: { include: { note: true }, orderBy: { position: "asc" } },
        accords: { include: { accord: true }, orderBy: { strength: "desc" } },
        reviews: {
          include: {
            user: { select: { username: true, name: true, avatar: true } },
            comments: {
              include: { user: { select: { username: true } } },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        tags: { include: { tag: { select: { name: true } } } },
      },
    });
  },
  ["perfume-page"],
  { revalidate: 30, tags: ["perfumes", "reviews"] }
);
