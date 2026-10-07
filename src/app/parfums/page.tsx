import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PerfumeGrid } from "@/components/parfum/PerfumeGrid";
import { CatalogueFilters } from "@/components/parfum/CatalogueFilters";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PerfumeCardData } from "@/components/parfum/PerfumeCard";

export const metadata: Metadata = {
  title: "Catalogue de parfums",
};

interface Props {
  searchParams: Promise<{ q?: string; accord?: string }>;
}

export default async function ParfumsPage({ searchParams }: Props) {
  const { q, accord } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });

  const raw = await prisma.perfume.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { house: { name: { contains: q, mode: "insensitive" } } },
              ],
            }
          : {},
        accord
          ? {
              accords: {
                some: { accord: { name: { equals: accord, mode: "insensitive" } } },
              },
            }
          : {},
      ],
    },
    include: {
      house: { select: { name: true } },
      accords: {
        include: { accord: { select: { name: true } } },
        orderBy: { strength: "desc" },
      },
      reviews: { select: { rating: true } },
    },
    orderBy: { name: "asc" },
  });

  const perfumes: PerfumeCardData[] = raw.map((p) => {
    const ratings = p.reviews.map((r) => r.rating);
    return {
      slug: p.slug,
      name: p.name,
      house: p.house.name,
      imageUrl: p.imageUrl ?? undefined,
      year: p.year ?? undefined,
      rating: ratings.length ? ratings.reduce((s, r) => s + r, 0) / ratings.length : undefined,
      reviewCount: ratings.length || undefined,
      accords: p.accords.map((a) => a.accord.name),
    };
  });

  const titre = accord
    ? `Parfums ${accord.toLowerCase()}`
    : q
    ? `Résultats pour "${q}"`
    : "Catalogue";

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{titre}</h1>
          <p className="text-muted-foreground">
            {perfumes.length} fragrance{perfumes.length !== 1 ? "s" : ""}
            {accord || q ? " trouvée" + (perfumes.length !== 1 ? "s" : "") : ""}
          </p>
        </div>
        {session && (
          <Link href="/parfums/nouveau" className={cn(buttonVariants({ size: "sm" }), "shrink-0")}>
            + Ajouter un parfum
          </Link>
        )}
      </div>

      <CatalogueFilters currentQuery={q} currentAccord={accord} />

      <PerfumeGrid perfumes={perfumes} />
    </div>
  );
}
