import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getCatalogPerfumes } from "@/lib/cache";
import { PerfumeGrid } from "@/components/parfum/PerfumeGrid";
import { CatalogueFilters } from "@/components/parfum/CatalogueFilters";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
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

  const raw = await getCatalogPerfumes(q, accord);

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

  const hasFilter = !!(q || accord);

  return (
    <div className="container mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {accord ? `Parfums ${accord}` : q ? `"${q}"` : "Catalogue"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {perfumes.length} fragrance{perfumes.length !== 1 ? "s" : ""}
            {hasFilter ? " trouvée" + (perfumes.length !== 1 ? "s" : "") : " dans la base"}
          </p>
        </div>
        {session && (
          <Link href="/parfums/nouveau" className={cn(buttonVariants({ size: "sm" }), "shrink-0")}>
            + Ajouter
          </Link>
        )}
      </div>

      <CatalogueFilters currentQuery={q} currentAccord={accord} />

      <PerfumeGrid perfumes={perfumes} />
    </div>
  );
}
