import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PerfumeGrid } from "@/components/parfum/PerfumeGrid";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { PerfumeCardData } from "@/components/parfum/PerfumeCard";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const maison = await prisma.house.findUnique({
    where: { slug },
    select: { name: true },
  });
  if (!maison) return { title: "Maison introuvable" };
  return { title: maison.name };
}

export default async function MaisonPage({ params }: Props) {
  const { slug } = await params;

  const maison = await prisma.house.findUnique({
    where: { slug },
    include: {
      perfumes: {
        include: {
          house: { select: { name: true } },
          accords: { include: { accord: { select: { name: true } } }, orderBy: { strength: "desc" } },
          reviews: { select: { rating: true } },
        },
        orderBy: { year: "desc" },
      },
    },
  });

  if (!maison) notFound();

  const parfums: PerfumeCardData[] = maison.perfumes.map((p) => {
    const ratings = p.reviews.map((r) => r.rating);
    return {
      slug: p.slug,
      name: p.name,
      house: maison.name,
      imageUrl: p.imageUrl ?? undefined,
      year: p.year ?? undefined,
      rating: ratings.length ? ratings.reduce((s, r) => s + r, 0) / ratings.length : undefined,
      reviewCount: ratings.length || undefined,
      accords: p.accords.map((a) => a.accord.name),
    };
  });

  const parfumeurs = await prisma.perfumer.findMany({
    where: {
      perfumes: { some: { perfume: { houseId: maison.id } } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      {/* En-tête */}
      <div className="flex items-start gap-6">
        <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground shrink-0">
          {maison.name[0]}
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">{maison.name}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {maison.country && <span>{maison.country}</span>}
            <span>{maison.perfumes.length} parfum{maison.perfumes.length !== 1 ? "s" : ""}</span>
            {maison.website && (
              <a
                href={maison.website}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground transition-colors"
              >
                Site officiel ↗
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Parfumeurs associés */}
      {parfumeurs.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground uppercase tracking-widest">
            Parfumeurs
          </p>
          <div className="flex flex-wrap gap-2">
            {parfumeurs.map((p) => (
              <Link key={p.id} href={`/parfumeurs/${p.slug}`}>
                <Badge variant="outline" className="hover:bg-muted cursor-pointer">
                  {p.name}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Catalogue de la maison */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Parfums de la maison
        </h2>
        <PerfumeGrid perfumes={parfums} />
      </div>
    </div>
  );
}
