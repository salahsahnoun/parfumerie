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
  const parfumeur = await prisma.perfumer.findUnique({
    where: { slug },
    select: { name: true },
  });
  if (!parfumeur) return { title: "Parfumeur introuvable" };
  return { title: parfumeur.name };
}

export default async function ParfumeurPage({ params }: Props) {
  const { slug } = await params;

  const parfumeur = await prisma.perfumer.findUnique({
    where: { slug },
    include: {
      perfumes: {
        include: {
          perfume: {
            include: {
              house: { select: { name: true, slug: true } },
              accords: { include: { accord: { select: { name: true } } }, orderBy: { strength: "desc" } },
              reviews: { select: { rating: true } },
            },
          },
        },
      },
    },
  });

  if (!parfumeur) notFound();

  const parfums: PerfumeCardData[] = parfumeur.perfumes.map(({ perfume: p }) => {
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

  // Maisons avec lesquelles ce parfumeur a travaillé
  const maisons = [
    ...new Map(
      parfumeur.perfumes.map(({ perfume: p }) => [p.house.name, p.house])
    ).values(),
  ];

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      {/* En-tête */}
      <div className="flex items-start gap-6">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground shrink-0">
          {parfumeur.name[0]}
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">{parfumeur.name}</h1>
          <p className="text-sm text-muted-foreground">
            {parfums.length} création{parfums.length !== 1 ? "s" : ""} dans notre catalogue
          </p>
          {parfumeur.bio && (
            <p className="text-sm max-w-prose leading-relaxed">{parfumeur.bio}</p>
          )}
        </div>
      </div>

      {/* Maisons associées */}
      {maisons.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground uppercase tracking-widest">
            Maisons
          </p>
          <div className="flex flex-wrap gap-2">
            {maisons.map((m) => (
              <Link key={m.name} href={`/maisons/${m.slug}`}>
                <Badge variant="outline" className="hover:bg-muted cursor-pointer">
                  {m.name}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Separator />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Créations</h2>
        <PerfumeGrid perfumes={parfums} />
      </div>
    </div>
  );
}
